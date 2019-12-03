import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, AfterContentInit, HostListener, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { CosComponent } from './cos/cos.component';
import { Anchor } from './api/anchor';
import { Cloud } from './api/cloud'
import { functions } from './api/functions'
import { element } from 'protractor';
import { MessageService } from 'primeng/components/common/messageservice';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService]
})
export class AppComponent implements OnInit {
  @HostListener('document:keydown', ['$event']) keyDownEvent(event: KeyboardEvent) {
    switch (this.step) {
      case 1:
        this.setupCOS.onKey(event);
        break;
      case 4:
        this.tagCOS.onKey(event);
        break;
    }
  }
  @HostListener('document:keyup', ['$event']) keyUpEvent(event: KeyboardEvent) {
    if (this.step == 4 && (event.keyCode == 65 || event.keyCode == 68 || event.keyCode == 83 || event.keyCode == 87 || event.keyCode == 88 || event.keyCode == 89)) {
      this.moveTag();
    }
  }
  //All
  anchors: any[] = [];
  // [{ "name": "#0", "lla": { "lat": 52.45607308466606, "lon": 13.296899711470958, "alt": 59.41934445686638 }, "pos": { "x": 9.030695703622445, "y": -15.246804094910352, "z": 2.39 }, "neighbours": { "#4": 22.318216774643982, "#6": 27.800289566837247, "#7": 16.369990836894196, "#9": 25.04858479036291, "#10": 20.649602901750917, "#12": 12.048323534832553, "#14": 12.134615774716561, "#15": 21.623212064815903, "#17": 26.26697736702874, "#18": 14.756940739868817, "#19": 18.398037938867287, "#20": 16.12450619398932, "#21": 8.603952580064586, "#22": 24.254148098830434, "#23": 20.933657110022608, "#24": 14.518188592245245, "#25": 25.288438069600108 } },
  // { "name": "#1", "lla": { "lat": 52.45599981981344, "lon": 13.296798289093383, "alt": 55.89285910408944 }, "pos": { "x": 0.8666142844882995, "y": -22.141372578996112, "z": -1.11 }, "neighbours": { "#7": 20.451217567665744, "#10": 24.66864811861404, "#12": 18.151203816827138, "#14": 22.722618687114387, "#15": 19.900371855822193, "#18": 13.79644157020208, "#19": 27.100647593738422, "#20": 26.698370736807146, "#21": 7.349564612954974, "#24": 22.778562290012946, "#25": 28.772789228713993 } },
  // { "name": "#2", "lla": { "lat": 52.45576455167647, "lon": 13.297237629633424, "alt": 54.76783483289182 }, "pos": { "x": -25.31686749930332, "y": 7.724423604562309, "z": -2.15 }, "neighbours": { "#6": 18.511048052446952, "#8": 24.360831266605004, "#10": 24.230429216173622, "#11": 12.620507121348174, "#13": 5.406116905876161, "#15": 20.281540868484328, "#16": 6.2159633203551, "#18": 28.683313964742638, "#25": 20.94263354977115, "#26": 11.046107911839359, "#27": 21.019176958197015, "#28": 28.98987581898205, "#29": 10.494122164335618 } },
  // { "name": "#3", "lla": { "lat": 52.45599020040323, "lon": 13.297415806356845, "alt": 58.84939022921026 }, "pos": { "x": -0.19420579041589348, "y": 19.8366021311859, "z": 1.85 }, "neighbours": { "#4": 24.258041965500848, "#6": 14.279730389611702, "#8": 19.094258299289866, "#10": 17.86258939795684, "#12": 25.512038334872422, "#13": 24.973640103116722, "#15": 27.379687726488047, "#16": 26.752936287443294, "#19": 19.678328181021882, "#20": 26.16507022730877, "#25": 14.798827656270614, "#26": 17.423332057904425, "#27": 13.776959025851824, "#28": 7.071202160877597, "#29": 28.200599284412384 } },
  // { "name": "#4", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 18.347833892876594, "y": 4.6106714738104095, "z": -1.73 }, "neighbours": { "#0": 22.318216774643982, "#3": 24.258041965500848, "#5": 23.15940197846222, "#6": 25.489034897382837, "#9": 7.697947778466672, "#10": 21.083986814642056, "#12": 15.751904646740345, "#14": 14.909423194744996, "#17": 13.351318286970765, "#18": 28.89069919541582, "#19": 12.401524099883854, "#20": 9.813709798032548, "#22": 20.91671341296237, "#23": 18.787059376070538, "#24": 25.379412916771734, "#25": 23.67350206454466, "#28": 19.025017739807765 } },
  // { "name": "#5", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 39.07323082696727, "y": -4.50518953458505, "z": 3.14 }, "neighbours": { "#4": 23.15940197846222, "#7": 29.681942321889917, "#9": 15.74119118745465, "#14": 20.036511672444384, "#17": 9.866620495387464, "#20": 24.164109749792146, "#22": 8.744952830061465, "#23": 11.205761910731457, "#24": 22.28516322578769 } },
  // { "name": "#6", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -6.931888006229222, "y": 7.386002211555008, "z": -0.02 }, "neighbours": { "#0": 27.800289566837247, "#2": 18.511048052446952, "#3": 14.279730389611702, "#4": 25.489034897382837, "#8": 24.476364109074694, "#10": 7.495745459925917, "#11": 26.44531905649845, "#12": 17.544520512114318, "#13": 13.682002777371446, "#15": 13.368343203254472, "#16": 19.0800078616336, "#18": 19.303274333646094, "#19": 17.410356113531968, "#20": 24.46399395029356, "#25": 3.44217954209248, "#26": 10.45130613846901, "#27": 18.26149227199136, "#28": 12.7428882126463, "#29": 23.65202105529251 } },
  // { "name": "#7", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 20.044352555282888, "y": -27.275430897412498, "z": 3.8 }, "neighbours": { "#0": 16.369990836894196, "#1": 20.451217567665744, "#5": 29.681942321889917, "#12": 27.493200977696283, "#14": 17.545087631585083, "#17": 29.116381986778507, "#18": 29.734661592155373, "#20": 26.943772935504043, "#21": 16.01757160121346, "#22": 21.37823425823564, "#23": 19.66312793021497, "#24": 8.27667807758644 } },
  // { "name": "#8", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -16.48095474517097, "y": 29.531776625994354, "z": 4.16 }, "neighbours": { "#2": 24.360831266605004, "#3": 19.094258299289866, "#6": 24.476364109074694, "#13": 25.019944044701614, "#16": 20.618038218996492, "#25": 26.425264426302338, "#26": 17.3143119990371, "#27": 6.667510779893793, "#28": 24.82870918916245, "#29": 17.346783563531314 } },
  // { "name": "#9", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 25.77784493910237, "y": 3.1834588572171674, "z": -0.31 }, "neighbours": { "#0": 25.04858479036291, "#4": 7.697947778466672, "#5": 15.74119118745465, "#10": 28.10901101070616, "#12": 21.712864850129748, "#14": 14.45437304070986, "#17": 5.986559947081463, "#19": 18.122301178382394, "#20": 12.76916990254261, "#22": 15.224181422986263, "#23": 13.96489885391226, "#24": 23.480046848334865, "#28": 26.228726617966036 } },
  // { "name": "#10", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -2.183736747968017, "y": 2.092198321281726, "z": 2.35 }, "neighbours": { "#0": 20.649602901750917, "#1": 24.66864811861404, "#2": 24.230429216173622, "#3": 17.86258939795684, "#4": 21.083986814642056, "#6": 7.495745459925917, "#9": 28.10901101070616, "#11": 29.675843711679036, "#12": 11.303096920755834, "#13": 19.018469970005473, "#14": 25.13729102349734, "#15": 11.349916299250847, "#16": 24.870916750292903, "#18": 13.780094339299716, "#19": 11.550519468837757, "#20": 18.11758262020626, "#21": 25.529663139179885, "#25": 4.646224273536524, "#26": 17.274327772738367, "#27": 24.971481734170286, "#28": 14.985239404160348 } },
  // { "name": "#11", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -31.625163499448057, "y": -0.8810979702498707, "z": 4.59 }, "neighbours": { "#2": 12.620507121348174, "#6": 26.44531905649845, "#10": 29.675843711679036, "#13": 14.62801763739708, "#15": 22.5051927341225, "#16": 13.463885026247068, "#18": 28.616060176061975, "#25": 27.604657215767052, "#26": 20.81995437074731, "#29": 19.6572480271273 } },
  // { "name": "#12", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 5.625147757042919, "y": -4.662157516797886, "z": -2.25 }, "neighbours": { "#0": 12.048323534832553, "#1": 18.151203816827138, "#3": 25.512038334872422, "#4": 15.751904646740345, "#6": 17.544520512114318, "#7": 27.493200977696283, "#9": 21.712864850129748, "#10": 11.303096920755834, "#13": 27.92544001443845, "#14": 15.586000128320288, "#15": 15.92961393129162, "#17": 25.447561769254047, "#18": 14.317087692683872, "#19": 11.520177950014489, "#20": 13.235663942545534, "#21": 19.098054874777173, "#22": 27.9167655719641, "#23": 24.783496524905438, "#24": 23.710982687353972, "#25": 15.577913852631234, "#26": 27.789105779063853, "#28": 20.203301710364077 } },
  // { "name": "#13", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -20.341072775612705, "y": 5.611921091500451, "z": -2.08 }, "neighbours": { "#2": 5.406116905876161, "#3": 24.973640103116722, "#6": 13.682002777371446, "#8": 25.019944044701614, "#10": 19.018469970005473, "#11": 14.62801763739708, "#12": 27.92544001443845, "#15": 15.265667361763127, "#16": 9.038069484132109, "#18": 23.83711391926464, "#25": 16.014100037154755, "#26": 8.815180088914802, "#27": 20.501651153016923, "#28": 24.96866836657494, "#29": 14.492125447980365 } },
  // { "name": "#14", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 19.87296241633967, "y": -9.916020613066058, "z": 1.26 }, "neighbours": { "#0": 12.134615774716561, "#1": 22.722618687114387, "#4": 14.909423194744996, "#5": 20.036511672444384, "#7": 17.545087631585083, "#9": 14.45437304070986, "#10": 25.13729102349734, "#12": 15.586000128320288, "#17": 14.379172437939538, "#18": 25.096063436324034, "#19": 17.519454900195953, "#20": 11.152443678405197, "#21": 19.81388654454244, "#22": 12.873383393653743, "#23": 9.553789823938981, "#24": 10.629134489693879, "#25": 29.410008500508805 } },
  // { "name": "#15", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -10.14344800920646, "y": -5.589728301494224, "z": -0.19 }, "neighbours": { "#0": 21.623212064815903, "#1": 19.900371855822193, "#2": 20.281540868484328, "#3": 27.379687726488047, "#6": 13.368343203254472, "#10": 11.349916299250847, "#11": 22.5051927341225, "#12": 15.92961393129162, "#13": 15.265667361763127, "#16": 22.764887436576533, "#18": 9.190070728781146, "#19": 21.58253692224341, "#20": 26.631120892669912, "#21": 23.064407644680585, "#25": 12.794944314064052, "#26": 19.02379036890388, "#28": 24.647275711526415, "#29": 29.48729048251128 } },
  // { "name": "#16", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -25.401994211782498, "y": 10.971107057383433, "z": 3.15 }, "neighbours": { "#2": 6.2159633203551, "#3": 26.752936287443294, "#6": 19.0800078616336, "#8": 20.618038218996492, "#10": 24.870916750292903, "#11": 13.463885026247068, "#13": 9.038069484132109, "#15": 22.764887436576533, "#25": 21.10987683526363, "#26": 9.717556277171747, "#27": 18.351223392460792, "#28": 29.003549782742112, "#29": 8.284576030190081 } },
  // { "name": "#17", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 30.566488632959867, "y": -0.34434379787549235, "z": 0.37 }, "neighbours": { "#0": 26.26697736702874, "#4": 13.351318286970765, "#5": 9.866620495387464, "#7": 29.116381986778507, "#9": 5.986559947081463, "#12": 25.447561769254047, "#14": 14.379172437939538, "#19": 22.71453499413977, "#20": 16.1894162958397, "#22": 10.19206554139052, "#23": 10.02086323626862, "#24": 21.204421708690855 } },
  // { "name": "#18", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -4.923292272952521, "y": -11.166041966385674, "z": 4.92 }, "neighbours": { "#0": 14.756940739868817, "#1": 13.79644157020208, "#2": 28.683313964742638, "#4": 28.89069919541582, "#6": 19.303274333646094, "#7": 29.734661592155373, "#10": 13.780094339299716, "#11": 28.616060176061975, "#12": 14.317087692683872, "#13": 23.83711391926464, "#14": 25.096063436324034, "#15": 9.190070728781146, "#19": 19.589367013765404, "#20": 22.77598296451769, "#21": 14.825805205788994, "#24": 28.840390080579702, "#25": 17.192678674366018, "#26": 26.3188487590168, "#28": 28.599594402718374 } },
  // { "name": "#19", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 8.771639294278815, "y": 2.803630519712587, "z": 5.94 }, "neighbours": { "#0": 18.398037938867287, "#1": 27.100647593738422, "#3": 19.678328181021882, "#4": 12.401524099883854, "#6": 17.410356113531968, "#9": 18.122301178382394, "#10": 11.550519468837757, "#12": 11.520177950014489, "#14": 17.519454900195953, "#15": 21.58253692224341, "#17": 22.71453499413977, "#18": 19.589367013765404, "#20": 7.5109852882295005, "#21": 25.414220428728484, "#22": 27.68513861262031, "#23": 24.30968942623496, "#24": 26.313886068005996, "#25": 14.505105997544453, "#26": 26.949732837265753, "#28": 16.43103466005717 } },
  // { "name": "#20", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 15.347549429611362, "y": -0.8250615162737506, "z": 5.87 }, "neighbours": { "#0": 16.12450619398932, "#1": 26.698370736807146, "#3": 26.16507022730877, "#4": 9.813709798032548, "#5": 24.164109749792146, "#6": 24.46399395029356, "#7": 26.943772935504043, "#9": 12.76916990254261, "#10": 18.11758262020626, "#12": 13.235663942545534, "#14": 11.152443678405197, "#15": 26.631120892669912, "#17": 16.1894162958397, "#18": 22.77598296451769, "#19": 7.5109852882295005, "#21": 23.90211078545157, "#22": 20.3028323147289, "#23": 16.881377313477714, "#24": 20.094603753246794, "#25": 21.64851496061566, "#28": 22.280462293229014 } },
  // { "name": "#21", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 4.872513386117572, "y": -22.29392547987243, "z": 5.05 }, "neighbours": { "#0": 8.603952580064586, "#1": 7.349564612954974, "#7": 16.01757160121346, "#10": 25.529663139179885, "#12": 19.098054874777173, "#14": 19.81388654454244, "#15": 23.064407644680585, "#18": 14.825805205788994, "#19": 25.414220428728484, "#20": 23.90211078545157, "#23": 27.428255504132963, "#24": 18.03004714358784, "#25": 29.911969176234454 } },
  // { "name": "#22", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 32.74171157995134, "y": -10.256160237402696, "z": 1.32 }, "neighbours": { "#0": 24.254148098830434, "#4": 20.91671341296237, "#5": 8.744952830061465, "#7": 21.37823425823564, "#9": 15.224181422986263, "#12": 27.9167655719641, "#14": 12.873383393653743, "#17": 10.19206554139052, "#19": 27.68513861262031, "#20": 20.3028323147289, "#23": 3.8674151574404303, "#24": 14.119918555005903 } },
  // { "name": "#23", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 29.26880333227614, "y": -9.929191885372203, "z": 2.99 }, "neighbours": { "#0": 20.933657110022608, "#4": 18.787059376070538, "#5": 11.205761910731457, "#7": 19.66312793021497, "#9": 13.96489885391226, "#12": 24.783496524905438, "#14": 9.553789823938981, "#17": 10.02086323626862, "#19": 24.30968942623496, "#20": 16.881377313477714, "#21": 27.428255504132963, "#22": 3.8674151574404303, "#24": 11.774319513245768 } },
  // { "name": "#24", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 22.684896803534667, "y": -19.50596977883906, "z": 4.88 }, "neighbours": { "#0": 14.518188592245245, "#1": 22.778562290012946, "#4": 25.379412916771734, "#5": 22.28516322578769, "#7": 8.27667807758644, "#9": 23.480046848334865, "#12": 23.710982687353972, "#14": 10.629134489693879, "#17": 21.204421708690855, "#18": 28.840390080579702, "#19": 26.313886068005996, "#20": 20.094603753246794, "#21": 18.03004714358784, "#22": 14.119918555005903, "#23": 11.774319513245768 } },
  // { "name": "#25", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -4.944828941772271, "y": 5.8288906952019035, "z": 2.32 }, "neighbours": { "#0": 25.288438069600108, "#1": 28.772789228713993, "#2": 20.94263354977115, "#3": 14.798827656270614, "#4": 23.67350206454466, "#6": 3.44217954209248, "#8": 26.425264426302338, "#10": 4.646224273536524, "#11": 27.604657215767052, "#12": 15.577913852631234, "#13": 16.014100037154755, "#14": 29.410008500508805, "#15": 12.794944314064052, "#16": 21.10987683526363, "#18": 17.192678674366018, "#19": 14.505105997544453, "#20": 21.64851496061566, "#21": 29.911969176234454, "#26": 12.89824019004143, "#27": 20.42218646472508, "#28": 13.181039412732215, "#29": 26.294693380984693 } },
  // { "name": "#26", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -15.968550039587498, "y": 12.454694281000643, "z": 1.35 }, "neighbours": { "#2": 11.046107911839359, "#3": 17.423332057904425, "#6": 10.45130613846901, "#8": 17.3143119990371, "#10": 17.274327772738367, "#11": 20.81995437074731, "#12": 27.789105779063853, "#13": 8.815180088914802, "#15": 19.02379036890388, "#16": 9.717556277171747, "#18": 26.3188487590168, "#19": 26.949732837265753, "#25": 12.89824019004143, "#27": 12.3773866385437, "#28": 19.288841333786745, "#29": 13.477303142691426 } },
  // { "name": "#27", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -13.145010651903547, "y": 24.505686992233915, "z": 1.32 }, "neighbours": { "#2": 21.019176958197015, "#3": 13.776959025851824, "#6": 18.26149227199136, "#8": 6.667510779893793, "#10": 24.971481734170286, "#13": 20.501651153016923, "#16": 18.351223392460792, "#25": 20.42218646472508, "#26": 12.3773866385437, "#28": 18.732765412506506, "#29": 16.638425406269675 } },
  // { "name": "#28", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": 2.6546545726384023, "y": 15.314545670700454, "z": -2.78 }, "neighbours": { "#2": 28.98987581898205, "#3": 7.071202160877597, "#4": 19.025017739807765, "#6": 12.7428882126463, "#8": 24.82870918916245, "#9": 26.228726617966036, "#10": 14.985239404160348, "#12": 20.203301710364077, "#13": 24.96866836657494, "#15": 24.647275711526415, "#16": 29.003549782742112, "#18": 28.599594402718374, "#19": 16.43103466005717, "#20": 22.280462293229014, "#25": 13.181039412732215, "#26": 19.288841333786745, "#27": 18.732765412506506 } },
  // { "name": "#29", "lla": { "lat": null, "lon": null, "alt": null }, "pos": { "x": -28.193900227992955, "y": 17.720281880770948, "z": -0.76 }, "neighbours": { "#2": 10.494122164335618, "#3": 28.200599284412384, "#6": 23.65202105529251, "#8": 17.346783563531314, "#11": 19.6572480271273, "#13": 14.492125447980365, "#15": 29.48729048251128, "#16": 8.284576030190081, "#25": 26.294693380984693, "#26": 13.477303142691426, "#27": 16.638425406269675 } }
  // ];
  sidebarVisable = false;
  step: number = 1;
  time: number;
  //Setup 1
  @ViewChild('setupCOS', { static: false }) setupCOS: CosComponent;
  heights: number[] = [];
  roof = { visible: true };
  buildingOrigin;
  //Setup 2
  selectedAnchor: any;
  selectedNeighbour: any;
  filterNeighbours = true;
  generatedAnchorsCount = 0;
  //Algorithmus
  cloud: Cloud;
  //Taggen
  @ViewChildren("row", { read: ElementRef }) rowElement: QueryList<ElementRef>;
  @ViewChild('tagCOS', { static: false }) tagCOS: CosComponent;
  selectedTag: any;
  selectedTagNeighbour: any;
  filterTagNeighbours = true;
  tags: any[] = [];
  showTrace = false;
  tagTimer;
  currentlla = { lat: null, lon: null, alt: null };
  constructor(private messageService: MessageService) { }
  ngOnInit() {
    setInterval(() => {
      this.time = Date.now();
    }, 1000);
    // setTimeout(() => {
    //   this.nextStep();
    //   this.nextStep();
    //   this.nextStep();
    // }, 10);
  }
  prevStep() {
    this.step--;
  }
  async nextStep() {
    let accuracy = 100;
    if (this.step == 1) {
      this.buildingOrigin = functions.altlatlon2ecef({ lat: this.setupCOS.lat, lon: this.setupCOS.lon, alt: this.setupCOS.alt });
      this.step++;
    }
    else if (this.step == 2) {
      this.buildingOrigin = functions.altlatlon2ecef({ lat: this.setupCOS.lat, lon: this.setupCOS.lon, alt: this.setupCOS.alt });
      this.messageService.add({ sticky: true, severity: 'info', summary: 'Berechnung der Anker-Positionen gestartet', detail: 'Dieser Vorgang kann einen Moment dauern' });
      await new Promise(resolve => setTimeout(() => resolve(), 300));
      this.cloud = new Cloud(this.messageService);
      this.anchors.filter(elem => { return !elem.lla.lat && !elem.lla.lon && !elem.lla.alt }).forEach(elem => {
        this.cloud.addNode(elem.name, null);
      });
      this.anchors.filter(elem => { return !elem.lla.lat && !elem.lla.lon && !elem.lla.alt }).forEach(elem => {
        for (let neighbour in elem.neighbours) {
          this.cloud.addDist(elem.name, neighbour, elem.neighbours[neighbour] * accuracy);
        }
      });
      this.cloud.calcPositions();
      let rtk = [];
      this.anchors.filter(elem => { return elem.lla.lat && elem.lla.lon && elem.lla.alt }).forEach(elem => {
        // let anchor=new Anchor(elem.name, elem.pos);
        let anchor = new Anchor(elem.name, { x: elem.pos.x * accuracy, y: elem.pos.y * accuracy, z: elem.pos.z * accuracy });
        for (let neighbour in elem.neighbours) {
          anchor.addNeighbour(this.cloud.getNodeByName(neighbour), elem.neighbours[neighbour] * accuracy);
        }
        rtk.push(anchor)
      });
      if (!this.cloud.adjustCOS(rtk)) { return; }
      this.step++;
    }
    else if (this.step == 3) {
      this.tagCOS.lat = this.setupCOS.lat;
      this.tagCOS.lon = this.setupCOS.lon;
      this.tagCOS.alt = this.setupCOS.alt;
      this.tagCOS.zoom = this.setupCOS.zoom;
      this.tagCOS.width = this.setupCOS.width;
      this.tagCOS.length = this.setupCOS.length;
      this.tagCOS.height = this.setupCOS.height;
      this.tagCOS.rotation = this.setupCOS.rotation;
      this.tagCOS.updateMap();
      this.tagCOS.updateWall();
      this.tagCOS.outlines = this.setupCOS.outlines;
      this.tagCOS.addLayers();
      this.tagCOS.addTag();
      this.tagCOS.nodes.forEach(elem => {
        this.tagCOS.scene.remove(elem);
      });
      this.tagCOS.nodes = [];
      this.anchors.forEach(elem => {
        if (elem.pos) {
          // console.log(elem.name,elem.pos);
          this.tagCOS.addNode({ x: elem.pos.x, y: elem.pos.y, z: elem.pos.z }, "#0000ff");
        }
      })
      this.cloud.anchors.forEach(elem => {
        if (elem.pos) {
          // console.log(elem.name,elem.pos);
          this.tagCOS.addNode({ x: elem.pos.x / accuracy, y: elem.pos.y / accuracy, z: elem.pos.z / accuracy }, "#00ff00");
        }
      })
      this.step++;
    }
    else {
      this.step++;
    }
  }

  //Setup
  loadSetup(target) {
    let file = target.files[0];
    let fileReader: FileReader = new FileReader();
    let self = this;
    fileReader.onloadend = function (x) {
      let content = JSON.parse((fileReader.result).toString());
      if (content.lat) { self.setupCOS.lat = content.lat; } else { console.log('Lat:Nein') }
      if (content.lon) { self.setupCOS.lon = content.lon; } else { console.log('Lon:Nein') }
      if (content.alt) { self.setupCOS.alt = content.alt; } else { console.log('Alt:Nein') }
      if (content.zoom) { self.setupCOS.zoom = content.zoom; }
      if (content.width) { self.setupCOS.width = content.width; }
      if (content.length) { self.setupCOS.length = content.length; }
      if (content.height) { self.setupCOS.height = content.height; }
      if (content.rotation) { self.setupCOS.rotation = content.rotation; }
      self.setupCOS.updateMap();
      self.setupCOS.updateWall();
      if (content.outlines) {
        self.setupCOS.clearLayers();
        self.setupCOS.outlines = content.outlines;
        self.setupCOS.addLayers();
      }
      if (content.anchors) {
        self.anchors = [...content.anchors];
        self.generatedAnchorsCount = Math.max(...self.anchors.map(elem => { return elem.name.startsWith("#") ? elem.name.substr(1) : 0 }), 0) + 1;
      }
      self.messageService.add({ sticky: true, severity: 'success', summary: 'Setup wurde erfolgreich geladen', detail: '' });
      self.nextStep();
    }
    fileReader.readAsText(file);
    target.value = "";
  }
  saveSetup() {
    let filename = prompt("Wie soll die Datei heißen?");
    if (filename) {
      let content = { lat: this.setupCOS.lat, lon: this.setupCOS.lon, alt: this.setupCOS.alt, zoom: this.setupCOS.zoom, width: this.setupCOS.width, length: this.setupCOS.length, height: this.setupCOS.height, rotation: this.setupCOS.rotation, outlines: this.setupCOS.outlines, anchors: this.anchors }
      var a = document.createElement("a");
      var file = new Blob([JSON.stringify(content)], { type: 'text/plain' });
      a.href = URL.createObjectURL(file);
      a.download = filename;
      a.click();
    }
  }

  //Setup 1
  onUpload(event) {
    event.originalEvent.body.okFiles.forEach(element => {
      this.addLayer(element.url, element.height);
    });
  }
  onError(event) {
    console.log(event)
    this.messageService.add({ sticky: true, severity: 'error', summary: 'Fehler beim Einfügen der Grundrisse', detail: 'Für mehr Details bitte die Konsole öffnen' });
  }
  onBeforeUpload(event) {
    event.formData.append("heights", this.heights.join(","));
  }
  addLayer(newURL, newHeight) {
    let newHeightVal = parseFloat(newHeight);
    this.setupCOS.outlines.push({ url: newURL, height: newHeightVal });
    this.setupCOS.addLayer(newURL, newHeightVal);
  }
  updateLayer(index, height) {
    this.setupCOS.updateLayer(index, parseFloat(height));
  }
  removeLayer(index) {
    this.setupCOS.removeLayer(index);
  }

  //Setup2
  generateAnchors(totalCount, fixedCount, rangeUWB, rangeToleranceUWB, accuracyUWB) {
    let totalCountVal = parseInt(totalCount.value);
    let fixedCountVal = parseInt(fixedCount.value);
    let rangeUWBVal = parseFloat(rangeUWB.value);
    let rangeToleranceUWBVal = parseFloat(rangeToleranceUWB.value);
    let accuracyUWBVal = parseFloat(accuracyUWB.value);
    if (this.setupCOS.lat && this.setupCOS.lon && this.setupCOS.sortedLayers.length > 0 && this.setupCOS.length && this.setupCOS.width && this.setupCOS.height && this.setupCOS.rotation && totalCountVal > 0 && fixedCountVal >= 0 && rangeUWBVal > 0 && rangeToleranceUWBVal >= 0 && accuracyUWBVal >= 0) {
      //Für alle Anker die lat,lon,alt angebenen haben=>x,y,z bestimmen
      this.anchors.filter(elem => { return elem.lla.lat && elem.lla.lon && elem.lla.alt }).forEach(elem => {
        elem.pos = functions.ecef2local(this.buildingOrigin, functions.altlatlon2ecef(elem.lla));
      });
      //Array mit neuen Anker erstellen(random x, y, z )
      for (let i = 0; i < totalCountVal; i++) {
        let x = functions.getRandom(-this.setupCOS.width / 2, this.setupCOS.width / 2);
        let y = functions.getRandom(-this.setupCOS.length / 2, this.setupCOS.length / 2);
        let pos = {
          x: (Math.cos(this.setupCOS.rotation) * x - Math.sin(this.setupCOS.rotation) * y) / 100,
          y: (Math.sin(this.setupCOS.rotation) * x + Math.cos(this.setupCOS.rotation) * y) / 100,
          z: functions.getRandom(this.setupCOS.sortedLayers[0].position.y, this.setupCOS.height) / 100
        };
        let lla = { lat: null, lon: null, alt: null };
        if (i < fixedCountVal) {
          lla = functions.ecef2altlatlon(functions.local2ecef(this.buildingOrigin, pos));
        }
        this.anchors.push(
          {
            name: "#" + this.generatedAnchorsCount,
            lla: lla,
            pos: pos,
            neighbours: {}
          });
        this.generatedAnchorsCount++;
      }
      // console.log(this.anchors)
      //Zu Ankern die per Hand und ohne Angabe einer Position hinzugefügt wurden, können keine Abstände bestimmt werden
      this.anchors.filter(elem => { return elem.pos.x && elem.pos.y && elem.pos.z }).forEach((a) => {
        a.neighbours = {};
        this.anchors.filter(elem => { return elem.pos.x && elem.pos.y && elem.pos.z }).forEach((b, i) => {
          let dist = Math.sqrt(Math.pow(a.pos.x - b.pos.x, 2) + Math.pow(a.pos.y - b.pos.y, 2) + Math.pow(a.pos.z - b.pos.z, 2)) + functions.getRandom(-accuracyUWBVal, accuracyUWBVal);
          // console.log(dist,Math.sqrt(Math.pow(a.pos.x - b.pos.x, 2) + Math.pow(a.pos.y - b.pos.y, 2) + Math.pow(a.pos.z - b.pos.z, 2)))
          if (a != b && (dist < rangeUWBVal + functions.getRandom(-rangeToleranceUWBVal, rangeToleranceUWBVal)) && (!a.lla.lat || !a.lla.lon || !a.lla.alt || !b.lla.lat || !b.lla.lon || !b.lla.alt)) {
            // console.log(a.name + "" + b.name);
            a.neighbours[b.name] = dist;
          }
        });
      });
      this.anchors = [...this.anchors];
    }
    else {
      this.messageService.add({ sticky: true, severity: 'error', summary: 'Fehler beim Generieren', detail: 'Für mehr Details bitte die Konsole öffnen' });
      console.log("totalCount: " + totalCountVal);
      console.log("fixedCount: " + fixedCountVal);
      console.log("rangeUWB: " + rangeUWBVal);
      console.log("rangeToleranceUWB: " + rangeToleranceUWBVal);
      console.log("accuracyUWB: " + accuracyUWBVal);
      console.log("originLat: " + this.setupCOS.lat);
      console.log("originLon: " + this.setupCOS.lon);
      console.log("layerCount: " + this.setupCOS.sortedLayers.length);
      console.log("width: " + this.setupCOS.width);
      console.log("length: " + this.setupCOS.length);
      console.log("rotation: " + this.setupCOS.rotation);
    }
  }
  addAnchor() {
    this.anchors = [...this.anchors, { name: "#" + this.generatedAnchorsCount, pos: { x: null, y: null, z: null }, lla: { lat: null, lon: null, alt: null }, neighbours: {} }];
  }
  removeAnchor() {
    let index = this.anchors.indexOf(this.selectedAnchor);
    this.anchors.forEach(elem => {
      if (elem.neighbours[this.selectedAnchor.name]) {
        delete elem.neighbours[this.selectedAnchor.name];
      }
    });
    this.anchors = this.anchors.filter(elem => { return elem != this.selectedAnchor });
    if (this.selectedNeighbour == this.selectedAnchor) {
      this.selectedNeighbour = this.anchors[index] || this.anchors[index - 1] || null;
    }
    this.selectedAnchor = this.anchors[index] || this.anchors[index - 1] || null;
    this.generatedAnchorsCount = Math.max(...this.anchors.map(elem => { return elem.name.startsWith("#") ? elem.name.substr(1) : 0 }), -1) + 1;
  }
  distChange(value) {
    let dist = parseFloat(value);
    if (dist) {
      this.selectedAnchor.neighbours[this.selectedNeighbour.name] = dist;
    }
    else {
      delete this.selectedAnchor.neighbours[this.selectedNeighbour.name];
    }
  }
  neighboursCount(anchor) {
    return Object.keys(anchor.neighbours).length;
  }
  nameRegex(event) {
    this.selectedAnchor.name = event.target.value.replace('#', '');
  }

  generateTagTimes(tagsCount, rangeUWB, rangeToleranceUWB, accuracyUWB) {
    let tagsCountVal = parseInt(tagsCount.value);
    let rangeUWBVal = parseFloat(rangeUWB.value);
    let rangeToleranceUWBVal = parseFloat(rangeToleranceUWB.value);
    let accuracyUWBVal = parseFloat(accuracyUWB.value);
    let moveRadius = 1;//m
    let moveAngleChange = 10;//Grad
    moveAngleChange = moveAngleChange * Math.PI / 180;
    if (this.setupCOS.lat && this.setupCOS.lon && this.setupCOS.sortedLayers.length > 0 && this.setupCOS.length && this.setupCOS.width && this.setupCOS.rotation && tagsCountVal > 0 && rangeUWBVal > 0 && rangeToleranceUWBVal >= 0 && accuracyUWBVal >= 0) {
      let tags = [];
      let last = this.tags.length > 0 ? this.tags[this.tags.length - 1].pos : { x: 0, y: 0, z: 0 };
      let moveAngle = this.tags.length > 1 ? (Math.atan2((this.tags[this.tags.length - 1].pos.y - this.tags[this.tags.length - 2].pos.y), (this.tags[this.tags.length - 1].pos.x - this.tags[this.tags.length - 2].pos.x)) + 2 * Math.PI) % (2 * Math.PI) : 0;
      for (let i = 0; i < tagsCountVal; i++) {
        moveAngle = (moveAngle + functions.getRandom(-moveAngleChange, moveAngleChange)) % (Math.PI * 2);
        let pos = {
          x: last.x + Math.cos(moveAngle) * moveRadius,
          y: last.y + Math.sin(moveAngle) * moveRadius,
          z: last.z + functions.getRandom(-moveRadius, moveRadius)
        };
        if (pos.z <= this.setupCOS.sortedLayers[0].position.y / 100 || pos.z >= this.setupCOS.sortedLayers[this.setupCOS.sortedLayers.length - 1].position.y / 100) {
          pos.z = last.z;
        }
        if (this.setupCOS.width / 200 < Math.abs(Math.cos(this.setupCOS.rotation) * pos.x + Math.sin(this.setupCOS.rotation) * pos.y) || this.setupCOS.length / 200 < Math.abs(Math.cos(this.setupCOS.rotation) * pos.y - Math.sin(this.setupCOS.rotation) * pos.x)) {
          pos.x = last.x;
          pos.y = last.y;
          moveAngle = (moveAngle + 90) % (Math.PI * 2);
        }
        last = pos;
        let tag = this.getTag(pos, rangeUWBVal, rangeToleranceUWBVal, accuracyUWBVal);
        tags.push(tag)
      }
      this.tags = [...this.tags, ...tags];
    }
    else {
      this.messageService.add({ sticky: true, severity: 'error', summary: 'Fehler beim Generieren', detail: 'Für mehr Details bitte die Konsole öffnen' });
      console.log("tagsCount: " + tagsCountVal);
      console.log("rangeUWB: " + rangeUWBVal);
      console.log("rangeToleranceUWB: " + rangeToleranceUWBVal);
      console.log("accuracyUWB: " + accuracyUWBVal);
    }
  }
  addTagTime() {
    let pos = { x: this.tagCOS.tag.position.x / 100, y: this.tagCOS.tag.position.z / 100, z: this.tagCOS.tag.position.y / 100 };
    let tag = this.getTag(pos);
    this.tags = [...this.tags, tag];
  }
  removeTagTime() {
    let index = this.tags.indexOf(this.selectedTag);
    this.tags = this.tags.filter(elem => { return elem != this.selectedTag });
    this.selectedTag = this.tags[index] || this.tags[index - 1] || null;
    this.updateTag()
  }
  tagDistChange(value) {
    let dist = parseFloat(value);
    if (dist) {
      this.selectedTag.neighbours[this.selectedTagNeighbour.name] = dist;
    }
    else {
      delete this.selectedTag.neighbours[this.selectedTagNeighbour.name];
    }
  }
  timerTick(self) {
    if (self.selectedTag) {
      self.nextTag();
    }
    else {
      self.pauseTag();
    }
  }
  playTag() {
    this.selectedTag = this.selectedTag || this.tags[0] || null;
    this.tagTimer = setInterval(this.timerTick, 100, this);
    this.updateTag();
  }
  pauseTag() {
    clearInterval(this.tagTimer)
  }
  nextTag() {
    let index = this.tags.indexOf(this.selectedTag);
    this.selectedTag = this.tags[index + 1] || null;
    this.updateTag();
  }
  prevTag() {
    let index = this.tags.indexOf(this.selectedTag);
    this.selectedTag = this.tags[index - 1] || null;
    this.updateTag();
  }
  firstTag() {
    this.selectedTag = this.tags[0] || null;
    this.updateTag();
  }
  lastTag() {
    this.selectedTag = this.tags[this.tags.length - 1] || null;
    this.updateTag();
  }
  updateTag(stayView?) {
    if (this.selectedTag) {
      if (!stayView) {
        let index = this.tags.indexOf(this.selectedTag);
        let el = this.rowElement.toArray()[index]
        el.nativeElement.scrollIntoView({ inline: "start", block: "start" });
      }
      this.currentlla = this.selectedTag.lla;
      if (this.selectedTag.cloudpos) {
        this.tagCOS.setTagPosition({ x: this.selectedTag.cloudpos.x, y: this.selectedTag.cloudpos.y, z: this.selectedTag.cloudpos.z });
      }
      if (this.showTrace) {
        this.tagCOS.addNode({ x: this.selectedTag.pos.x, y: this.selectedTag.pos.y, z: this.selectedTag.pos.z }, "#00ffff")
      }
    }
  }
  selectedTagChange() {
    this.updateTag(true);
  }
  loadTrace(target) {
    let file = target.files[0];
    let fileReader: FileReader = new FileReader();
    let self = this;
    fileReader.onloadend = function (x) {
      let content = JSON.parse((fileReader.result).toString());
      if (content.tags) {
        self.tags = [...content.tags];
        self.messageService.add({ sticky: true, severity: 'success', summary: 'Pfad wurde erfolgreich geladen', detail: '' });
      }
      else {
        self.messageService.add({ sticky: true, severity: 'error', summary: 'Datei beinhaltet keinen Pfad', detail: '' });
      }
    }
    fileReader.readAsText(file);
    target.value = "";
  }
  saveTrace() {
    let filename = prompt("Unter welchem Namen soll der Pfad gespeichert werden?");
    if (filename) {
      let content = { tags: this.tags }
      var a = document.createElement("a");
      var file = new Blob([JSON.stringify(content)], { type: 'text/plain' });
      a.href = URL.createObjectURL(file);
      a.download = filename;
      a.click();
    }
  }
  moveTag() {
    let pos = { x: this.tagCOS.tag.position.x / 100, y: this.tagCOS.tag.position.z / 100, z: this.tagCOS.tag.position.y / 100 };
    let tag = this.getTag(pos);
    this.currentlla = tag.lla;
    if (this.showTrace) {
      this.tags = [...this.tags, tag];
      // this.tagCOS.addNode({ x: tag.pos.x, y: tag.pos.y, z: tag.pos.z }, "#00ffff");
    }
  }
  getTag(pos, rangeUWB?, rangeToleranceUWB?, accuracyUWB?) {
    let rangeUWBVal = rangeUWB || 30;
    let rangeToleranceUWBVal = rangeToleranceUWB || 2;
    let accuracyUWBVal = accuracyUWB || 0;

    let neighbours = {};
    let lla = { lat: null, lon: null, alt: null };
    this.anchors.forEach(b => {
      let dist = Math.sqrt(Math.pow(pos.x - b.pos.x, 2) + Math.pow(pos.y - b.pos.y, 2) + Math.pow(pos.z - b.pos.z, 2)) + functions.getRandom(-accuracyUWBVal, accuracyUWBVal);
      // console.log(dist,Math.sqrt(Math.pow(pos.x - b.pos.x, 2) + Math.pow(pos.y - b.pos.y, 2) + Math.pow(pos.z - b.pos.z, 2)))
      if ((dist < rangeUWBVal + functions.getRandom(-rangeToleranceUWBVal, rangeToleranceUWBVal)) && (!b.lla.lat || !b.lla.lon || !b.lla.alt)) {
        // console.log(a.name + "" + b.name);
        neighbours[b.name] = dist;
      }
    });
    // lla = functions.ecef2altlatlon(functions.local2ecef(this.buildingOrigin, pos));
    // return { time: Date.now(), pos: pos, lla: lla, neighbours: neighbours }
    let anchor = new Anchor("Tag", { x: pos.x * 100, y: pos.y * 100, z: pos.z * 100 });
    for (let neighbour in neighbours) {
      anchor.addNeighbour(this.cloud.getNodeByName(neighbour), neighbours[neighbour] * 100);
    }
    let cloudpos = this.cloud.getTagPosition(anchor);
    if (cloudpos) {
      cloudpos = { x: cloudpos.x / 100, y: cloudpos.y / 100, z: cloudpos.z / 100 }
      lla = functions.ecef2altlatlon(functions.local2ecef(this.buildingOrigin, cloudpos));
    }
    return { time: Date.now(), cloudpos: cloudpos, pos: pos, lla: lla, neighbours: neighbours }
  }
}