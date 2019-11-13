import controlP5.*;
import java.util.*;
import processing.serial.*;

ControlP5 cp5;
Serial gps;

ScrollableList myList;
Textarea myTextarea;
Textfield myTextfield;
Textlabel myTextlabelA;
Textlabel myTextlabelB;
Textlabel myTextlabelC;;
Button myButtonA;
Button myButtonB;
String receive="";
Boolean resetflag=false;
List l;

int fpos = 0;
long lastScreenUpdate = millis();
char[] UBX_HEADER = { 0xB5, 0x62 }; //181 oder 10110101, 98 oder 1100010
char[] checksum = new char[2];
int payloadSize = 96;

geoloc originLocation = new geoloc();
geoloc currentLocation = new geoloc();
pvt_message pvt = new pvt_message();

public class geoloc {
    long lat;
    long lon;
    geoloc(long x, long y) {
        lat = x;
        lon = y;
    }
    geoloc() {
        lat = 0;
        lon = 0;
    }
};

public class pvt_message {
    char[] data = new char[96];
    
    char cls(){return (char)data[0];}
    char id(){return (char)data[1];}
    short len(){return (short)(data[3]<<8|data[2]);}
    long iTOW(){return (long)(data[7]<<24|data[6]<<16|data[5]<<8|data[4]);}           // GPS time of week of the navigation epoch (ms)

    short year(){return (short)(data[9]<<8|data[8]);}                                 // Year (UTC)
    char month(){return (char)data[10];}                                              // Month, range 1..12 (UTC)
    char day(){return (char)data[11];}                                                // Day of month, range 1..31 (UTC)
    char hour(){return (char)data[12];}                                               // Hour of day, range 0..23 (UTC)
    char minute(){return (char)data[13];}                                             // Minute of hour, range 0..59 (UTC)
    char second(){return (char)data[14];}                                             // Seconds of minute, range 0..60 (UTC)
    byte valid(){return (byte)data[15];}                                              // Validity Flags (see graphic below)
    long tAcc(){return (long)(data[19]<<24|data[18]<<16|data[17]<<8|data[16]);}       // Time accuracy estimate (UTC) (ns)
    long nano(){return (long)(data[23]<<24|data[22]<<16|data[21]<<8|data[20]);}       // Fraction of second, range -1e9 .. 1e9 (UTC) (ns)
    byte fixType(){return (byte)data[24];}                                            // GNSSfix Type, range 0..5
    char flags(){return (char)data[25];}                                              // Fix Status Flags
    char reserved1(){return (char)data[26];}                                          // reserved
    char numSV(){return (char)data[27];}                                              // Number of satellites used in Nav Solution

    long lon(){return (long)(data[31]<<24|data[30]<<16|data[29]<<8|data[28]);}        // Longitude (deg)
    long lat(){return (long)(data[35]<<24|data[34]<<16|data[33]<<8|data[32]);}        // Latitude (deg)
    long height(){return (long)(data[39]<<24|data[38]<<16|data[37]<<8|data[36]);}     // Height above Ellipsoid (mm)
    long hMS(){return (long)(data[43]<<24|data[42]<<16|data[41]<<8|data[40]);}        // Height above mean sea level (mm)
    long hAcc(){return (long)(data[47]<<24|data[46]<<16|data[45]<<8|data[44]);}       // Horizontal Accuracy Estimate (mm)
    long vAcc(){return (long)(data[51]<<24|data[50]<<16|data[49]<<8|data[48]);}       // Vertical Accuracy Estimate (mm)

    long velN(){return (long)(data[55]<<24|data[54]<<16|data[53]<<8|data[52]);}       // NED north velocity (mm/s)
    long velE(){return (long)(data[59]<<24|data[58]<<16|data[57]<<8|data[56]);}       // NED east velocity (mm/s)
    long velD(){return (long)(data[63]<<24|data[62]<<16|data[61]<<8|data[60]);}       // NED down velocity (mm/s)
    long gSpeed(){return (long)(data[67]<<24|data[66]<<16|data[65]<<8|data[64]);}     // Ground Speed (2-D) (mm/s)
    long heading(){return (long)(data[71]<<24|data[70]<<16|data[69]<<8|data[68]);}    // Heading of motion 2-D (deg)
    long sAcc(){return (long)(data[75]<<24|data[74]<<16|data[73]<<8|data[72]);}       // Speed Accuracy Estimate
    long headingAcc(){return (long)(data[79]<<24|data[78]<<16|data[77]<<8|data[76]);} // Heading Accuracy Estimate
    short pDOP(){return (short)(data[81]<<8|data[80]);}                               // Position dilution of precision
    short reserved2(){return (short)(data[83]<<8|data[82]);}                          // Reserved
    long reserved3(){return (long)(data[87]<<24|data[86]<<16|data[85]<<8|data[84]);}  // Reserved
};

//HILFSFUNKTIONEN
double geoDistance(geoloc a, geoloc b)   // returns meters
{
    //println((int)pvt.data[31]+"--"+(int)pvt.data[30]+"--"+(int)pvt.data[29]+"--"+(int)pvt.data[28]+"--"+(int)pvt.data[35]+"--"+(int)pvt.data[34]+"--"+(int)pvt.data[33]+"--"+(int)pvt.data[32]);
    //println(a.lat+"--"+a.lon);
    double R = 6371000; // km
    double p1 = (double)(a.lat * 0.0000001 * (Math.PI/180));//0.0174532925199432957f);
    double p2 = (double)(b.lat * 0.0000001 * (Math.PI/180));//0.0174532925199432957f);
    double dp = (double)((b.lat-a.lat) * 0.0000001 * (Math.PI/180));//0.0174532925199432957f);
    double dl = (double)((b.lon-a.lon) * 0.0000001 * (Math.PI/180));//0.0174532925199432957f);
    //println(p1+"--"+p1+"--"+dp+"--"+dl+"--"+(b.lon-a.lon));
    double z1 = Math.sin(dp/2);
    double z2 = Math.sin(dl/2);
    double x = z1 * z1 + Math.cos(p1) * Math.cos(p2) * z2 * z2;
    double y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));

    return R * y;
}

boolean processGPS(){
    while ((gps!=null) && (gps.available()>0)) {//(gps!=null) && (gps.available()>0)//gpsAvailable()
        char c = (char)gps.read();//(char)gps.read()//gpsRead()
        if(((fpos)%16)==0) {
          myTextarea.append((fpos/16)+": "+receive+"\n");
          receive="";
        }
        if(c<10){
          receive+="00"+(int)c+" ";
        }
        else if(c<100){
          receive+="0"+(int)c+" ";
        }
        else{
          receive+=(int)c+" ";
        }
        if ( fpos < 2 ) {
            if ( c == UBX_HEADER[fpos] ){
                myTextarea.setText("");
                fpos++;
            }
            else{
                fpos = 0;
            }
        } 
        else {
            if ( (fpos-2) < payloadSize ){
                pvt.data[fpos-2] = c;
                //checksum[0] = (char) ((checksum[0] + c) % 256);
                //checksum[1] = (char) ((checksum[1] + checksum[0]) % 256);
            }
            fpos++;
            if ( fpos == (payloadSize+2) ) {
                checksum=calcChecksum();
            } 
            else if ( fpos == (payloadSize+3) ) {
               //println((int)c + "!=" + (int)checksum[0]);
               if ( c != checksum[0] )
                   fpos = 0;     
            } 
            else if ( fpos == (payloadSize + 4) ) {
                //println((int)c + "==" + (int)checksum[1]);
                fpos = 0;
                if ( c == checksum[1] ) {
                    return true;
                }
            } 
            else if ( fpos > payloadSize+4 ) {
                fpos = 0;
            } 
        }
    }
    return false;
}

void setup() {
  size(400, 400);
  cp5 = new ControlP5(this);
  l = Arrays.asList(Serial.list());
  
  myList = cp5.addScrollableList("dropdown")
          .setPosition(240, 10)
          .setSize(100, 100)
          .setBarHeight(20)
          .setItemHeight(20)
          .addItems(l)
          .setCaptionLabel("Select Port")
          ;
  myTextarea = cp5.addTextarea("output")
               .setPosition(0,300)
               .setSize(400,100)
               .setFont(createFont("arial",12))
               .setLineHeight(14)
               .setColor(color(255))
               .setColorBackground(color(30))
               .setColorForeground(color(120));
               ;
  myTextfield = cp5.addTextfield("input")
               .setPosition(10,270)
               .setSize(290,20)
               .setFont(createFont("arial",12))
               .setFocus(true)
               .setAutoClear(true)
               .setCaptionLabel("")
               ;
 myTextlabelA = cp5.addTextlabel("label1")
                 .setText("Satelliten:")
                 .setPosition(50,100)
                 .setColorValue(0)
                 .setFont(createFont("Georgia",20))
                 ;
  myTextlabelB = cp5.addTextlabel("label2")
                 .setText("Genauigkeit:")
                 .setPosition(50,120)
                 .setColorValue(0)
                 .setFont(createFont("Georgia",20))
                 ;
  myTextlabelC = cp5.addTextlabel("label3")
                 .setText("Abstand:")
                 .setPosition(50,150)
                 .setColorValue(0)
                 .setFont(createFont("Georgia",20))
                 ;

  myButtonA = cp5.addButton("reload")
              .setValue(0)
              .setPosition(340,10)
              .setSize(50,20)
              ;
  myButtonB = cp5.addButton("reset")
              .setValue(0)
              .setPosition(10,10)
              .setSize(50,20)
              ;
  myButtonB = cp5.addButton("send")
              .setValue(0)
              .setPosition(310,270)
              .setSize(80,20)
              ;
}

void draw() {
  background(200);
  if ( processGPS() ) {
        if(resetflag){
          originLocation.lat = pvt.lat();// * 0.0000001;
          originLocation.lon = pvt.lon();// * 0.0000001;
          currentLocation.lat = pvt.lat();// * 0.0000001;
          currentLocation.lon = pvt.lon();// * 0.0000001; 
          resetflag=false;
        }
        else{
          currentLocation.lat = pvt.lat();// * 0.0000001;
          currentLocation.lon = pvt.lon();// * 0.0000001;  
        }
        long now = millis();
        if ( now - lastScreenUpdate > 1000 ) {
          myTextlabelA.setText("Satelliten: " + (int) pvt.numSV()+"");
          myTextlabelB.setText("Genauigkeit: " + (int) pvt.hAcc()+" mm");
          myTextlabelC.setText("Abstand: " + String.format("%.02f",(geoDistance( currentLocation, originLocation ) * 100))+" cm");
          lastScreenUpdate = now;
        }
    }
    getData();
}

void dropdown(int n) {
  try{
    if(gps!=null) gps.stop();
    gps=null;
    gps= new Serial(this, Serial.list()[n], 9600);
    myTextarea.setText(Serial.list()[n]+" ist nun ausgewählt\n");
    resetflag=true;
    /*while ( ! processGPS() ) {
      getData();
    }
    println("New origin");
    originLocation.lat = pvt.lat() * 0.0000001;
    originLocation.lon = pvt.lon() * 0.0000001;*/
  }
  catch(Exception ex){
    myTextarea.setText("Fehler beim Öffnen des "+Serial.list()[n]+":"+ex.getMessage()+"\n");
  }
}
public void reload() {
  l = Arrays.asList(Serial.list());
  myList.setItems(l);
}

public void reset(){
  resetflag=true;
}

//Unnötig 
void input(String send) {
  if (gps!=null){
    //gps.write(send);
    myTextarea.append("->:" + send + "\n");
  }
  else{
    myTextarea.setText("Fehler beim Senden der Zeichenkette: Wähle zuerst einen Port aus\n");
  }
}

int buffer_size = 1024;
char[] rx_buffer = new char[buffer_size+1];
volatile int rx_in=0;
volatile int rx_out=0;

void getData(){   
  while ((gps!=null) && (gps.available()>0) && (((rx_in + 1) % buffer_size) != rx_out)) {
        rx_buffer[rx_in] =  (char)gps.read();
        rx_in = (rx_in + 1) % buffer_size;
  }
}
boolean gpsAvailable()
{
  return rx_in != rx_out;
}

char gpsRead() {
  char c = rx_buffer[rx_out];
  rx_out = (rx_out + 1) % buffer_size;
  return c;
}
char[] calcChecksum() {
  char[] CK={0,0};
  for (int i = 0; i < 96; i++) {
    //CK[0] += pvt.data[i];
    //CK[1] += CK[0];
    CK[0] = (char) ((CK[0] + pvt.data[i]) % 256);
    CK[1] = (char) ((CK[1] + CK[0]) % 256);
  }
  return CK;
}