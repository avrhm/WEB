import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// הצהרה על האובייקט "Android" כדי ש-TypeScript לא יתלונן שהוא לא קיים.
// האובייקט הזה מוזרק על ידי אפליקציית האנדרואיד בזמן ריצה.
declare const Android: any;
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'my-webview-appcd';

    onTagVideosClick(): void {
    console.log("Button clicked. Trying to call native Android code...");

    // בדיקה האם האובייקט 'Android' קיים.
    // זה יקרה רק כשהאתר רץ בתוך ה-WebView של האפליקציה שלנו.
    if (typeof Android !== 'undefined' && Android.openCamera) {
      console.log("Android interface found. Calling openCamera().");
      // קריאה לפונקציית ה-Kotlin שחשפנו!
      Android.openCamera();
    } else {
      // הודעת שגיאה למקרה שמריצים את האתר בדפדפן רגיל
      console.error("Android interface is not available.");
      alert("This feature is only available within the King Road App.");
    }
  }
}
