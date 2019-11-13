#define monitoring Serial
#define gps Serial1

#ifndef DEGTORAD
#define DEGTORAD 0.0174532925199432957f
#define RADTODEG 57.295779513082320876f
#endif

struct geoloc {
  double lat;
  double lon;
  geoloc(double x = 0., double y = 0., int32_t a = 0.) {
    lat = x;
    lon = y;
  }
};

struct NAV_PVT
{
  unsigned char cls;       //1  //
  unsigned char id;        //2  //
  unsigned short len;      //4  //
  unsigned long iTOW;      //8  // GPS time of week of the navigation epoch (ms)

  unsigned short year;     //10 // Year (UTC)
  unsigned char month;     //11 // Month, range 1..12 (UTC)
  unsigned char day;       //12 // Day of month, range 1..31 (UTC)
  unsigned char hour;      //13 // Hour of day, range 0..23 (UTC)
  unsigned char minute;    //14 // Minute of hour, range 0..59 (UTC)
  unsigned char second;    //15 // Seconds of minute, range 0..60 (UTC)
  char valid;              //16 // Validity Flags (see graphic below)
  unsigned long tAcc;      //20 // Time accuracy estimate (UTC) (ns)
  long nano;               //24 // Fraction of second, range -1e9 .. 1e9 (UTC) (ns)
  unsigned char fixType;   //25 // GNSSfix Type, range 0..5
  char flags;              //26 // Fix Status Flags
  unsigned char reserved1; //27 // reserved
  unsigned char numSV;     //28 // Number of satellites used in Nav Solution

  long lon;                //32 // Longitude (deg)
  long lat;                //36 // Latitude (deg)
  long height;             //40 // Height above Ellipsoid (mm)
  long hMSL;               //44 // Height above mean sea level (mm)
  unsigned long hAcc;      //48 // Horizontal Accuracy Estimate (mm)
  unsigned long vAcc;      //52 // Vertical Accuracy Estimate (mm)

  long velN;               //56 // NED north velocity (mm/s)
  long velE;               //60 // NED east velocity (mm/s)
  long velD;               //64 // NED down velocity (mm/s)
  long gSpeed;             //68 // Ground Speed (2-D) (mm/s)
  long heading;            //72 // Heading of motion 2-D (deg)
  unsigned long sAcc;      //76 // Speed Accuracy Estimate
  unsigned long headingAcc;//80 // Heading Accuracy Estimate
  unsigned short pDOP;     //82 // Position dilution of precision
  short reserved2;         //84 // Reserved
  unsigned long reserved3; //88 // Reserved
  // Most receivers prior to the M8 series have an older firmware with a
  // smaller size NAV_PVT message. For Neo-7M you should comment this out.
  uint8_t dummy[8];        //96
};

//VARIABLEN
const int buffer_size = 1024;
char rx_buffer[buffer_size + 1];
volatile int rx_in = 0;
volatile int rx_out = 0;

double distance = 0.;
int numSV = 0;
float hAcc = 0.;
uint64_t lastScreenUpdate = 0;

char spinnerBuf[16];
char satsBuf[32];
char haccBuf[32];
char distBuf[32];

char* spinnerChars = "/-\\|"; // \\ bedeutet \ und braucht nur den backslash um entmaskiert zuwerden!!!
uint8_t screenRefreshSpinnerPos = 0;
uint8_t gpsUpdateSpinnerPos = 0;

const unsigned char UBX_HEADER[] = { 0xB5, 0x62 };

geoloc originLocation;
geoloc currentLocation;

NAV_PVT pvt;

//HILFSFUNKTIONEN

// http://www.movable-type.co.uk/scripts/latlong.html
float geoDistance(struct geoloc &a, struct geoloc &b)   // returns meters
{
  const double R = 6371000; // km
  double p1 = a.lat * DEGTORAD;
  double p2 = b.lat * DEGTORAD;
  double dp = (b.lat - a.lat) * DEGTORAD;
  double dl = (b.lon - a.lon) * DEGTORAD;

  double x = sin(dp / 2) * sin(dp / 2) + cos(p1) * cos(p2) * sin(dl / 2) * sin(dl / 2);
  double y = 2 * atan2(sqrt(x), sqrt(1 - x));

  return R * y;
}


bool gpsAvailable()
{
  return rx_in != rx_out;
}

char gpsRead() {
  cli();
  char c = rx_buffer[rx_out];
  rx_out = (rx_out + 1) % buffer_size;
  sei();
  return c;
}

//VERARBEITEN

void calcChecksum(unsigned char* CK) {
  memset(CK, 0, 2);
  for (int i = 0; i < (int)sizeof(NAV_PVT); i++) {
    CK[0] += ((unsigned char*)(&pvt))[i];
    CK[1] += CK[0];
  }
}

bool processGPS() {
  static int fpos = 0;
  static unsigned char checksum[2];
  const int payloadSize = sizeof(NAV_PVT);

  while ( gpsAvailable() ) {
    //monitoring.println("GPS available");
    char c0 = gpsRead();
    unsigned char c = *(unsigned char*)(&c0);
    if ( fpos < 2 ) {
      if ( c == UBX_HEADER[fpos] )
        fpos++;
      else
        fpos = 0;
    } else {
      if ( (fpos - 2) < payloadSize )
        ((unsigned char*)(&pvt))[fpos - 2] = c;

      fpos++;

      if ( fpos == (payloadSize + 2) ) {
        calcChecksum(checksum);
      } else if ( fpos == (payloadSize + 3) ) {
        if ( c != checksum[0] )
          fpos = 0;
      } else if ( fpos == (payloadSize + 4) ) {
        fpos = 0;
        if ( c == checksum[1] ) {
          digitalWrite(LED_BUILTIN, CHANGE);
          return true;
        }
      } else if ( fpos > (payloadSize + 4) ) {
        fpos = 0;
      }
    }
  }
  return false;
}

//AUSGABE

void updateScreen()
{
  sprintf(spinnerBuf, "%c %c", spinnerChars[screenRefreshSpinnerPos], spinnerChars[gpsUpdateSpinnerPos]);
  sprintf(satsBuf, "Sats: %d", numSV);
  //sprintf(haccBuf, "hAcc: %d", (int)hAcc);
  dtostrf(hAcc, 8, 0, haccBuf);
  //sprintf(distBuf, "%d", distance);
  dtostrf(distance, 8, 2, distBuf);
  monitoring.println(spinnerBuf);
  monitoring.println(satsBuf);
  monitoring.println(haccBuf);
  monitoring.println(distBuf);
}

void checkScreenUpdate()
{
  uint64_t now = millis();
  if ( now - lastScreenUpdate > 1000 ) {
    updateScreen();
    lastScreenUpdate = now;
    screenRefreshSpinnerPos = (screenRefreshSpinnerPos + 1) % 4;
  }
}

//HAUPTPROGRAMM

void setup() {
  gps.begin(19200);
  monitoring.begin(19200);
  while ( ! processGPS() ) {
    checkScreenUpdate();
    myserialEvent1();
  }
  monitoring.println("Get Origin");
  originLocation.lat = pvt.lat * 0.0000001;
  originLocation.lon = pvt.lon * 0.0000001;
  
}

void loop() {
  if ( processGPS() ) {
    monitoring.println("Get Current");
    currentLocation.lat = pvt.lat * 0.0000001;
    currentLocation.lon = pvt.lon * 0.0000001;
    numSV = pvt.numSV;
    hAcc = pvt.hAcc;
    distance = geoDistance( currentLocation, originLocation ) * 100;
    gpsUpdateSpinnerPos = (gpsUpdateSpinnerPos + 1) % 4;
  }
  checkScreenUpdate();
  myserialEvent1();
}

void myserialEvent1() {
  while ((gps.available()) && (((rx_in + 1) % buffer_size) != rx_out)) {
    //monitoring.println("Get Data");
    rx_buffer[rx_in] =  (char)gps.read();
    rx_in = (rx_in + 1) % buffer_size;
  }
}
