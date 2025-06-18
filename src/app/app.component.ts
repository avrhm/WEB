import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// הצהרה על האובייקט "Android" כדי ש-TypeScript לא יתלונן שהוא לא קיים.
// האובייקט הזה מוזרק על ידי אפליקציית האנדרואיד בזמן ריצה.
declare const Android: any;

@Component({
  selector: 'app-root',
  standalone: true, // ודא שזה מוגדר נכון עבור הגרסה שלך של אנגולר
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'my-webview-appcd';

  constructor() {
    // חשיפת הפונקציות לאובייקט window כדי שקוד ה-Kotlin יוכל לקרוא להן
    // bind(this) מבטיח שהקונטקסט (this) בתוך הפונקציה יהיה של הקומפוננטה.
    (window as any).onCameraSuccess = this.onCameraSuccess.bind(this);
    (window as any).onCameraFailure = this.onCameraFailure.bind(this);
  }

  onCameraSuccess(): void {
    console.log("Camera activity launched successfully (from Android callback).");
    // כאן תוכל להוסיף לוגיקה נוספת אם תרצה לאחר הפעלה מוצלחת של אקטיביטי המצלמה.
    // לדוגמה: להציג הודעת הצלחה למשתמש או לבצע ניווט.
  }

  onCameraFailure(errorMessage: string): void {
    console.error("Camera launch failed (from Android callback):", errorMessage);
    // הצגת הפופאפ למשתמש עם הודעת השגיאה שהתקבלה מהאנדרואיד.
    alert(`מצלמה לא מחוברת / תקולה: ${errorMessage}`);
  }

  onTagVideosClick(): void {
    console.log("Button clicked. Trying to call native Android code...");

    // בדיקה האם האובייקט 'Android' קיים והאם הפונקציה 'openCamera' זמינה עליו.
    // זה מבטיח שהקוד ירוץ רק בתוך ה-WebView של האפליקציה.
    if (typeof Android !== 'undefined' && Android.openCamera) {
      console.log("Android interface found. Calling openCamera().");
      // קריאה לפונקציית ה-Kotlin שחשפנו, ומעבירים את שמות פונקציות ה-callback.
      // ה-Android יקרא לאחת מהפונקציות האלה (onCameraSuccess או onCameraFailure)
      // בהתאם לתוצאת ניסיון הפעלת המצלמה.
      Android.openCamera('onCameraSuccess', 'onCameraFailure');
    } else {
      // הודעת שגיאה למקרה שמריצים את האתר בדפדפן רגיל או שהממשק לא זמין.
      console.error("Android interface is not available.");
      alert("תכונה זו זמינה רק באפליקציית King Road.");
    }
  }
}