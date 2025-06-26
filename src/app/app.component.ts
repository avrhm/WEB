import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Declare the "Android" object, which is injected by the Android application at runtime.
// This prevents TypeScript from complaining about it not being defined.
declare const Android: any;

@Component({
  selector: 'app-root',
  standalone: true, // Ensure this is correctly configured for your Angular version.
  imports: [RouterOutlet],
  template: `
    <!-- Simple HTML for testing: a button, and areas to display metadata and camera messages -->
    <div style="padding: 20px; text-align: center; font-family: 'Inter', sans-serif;">
      <h1 style="color: #333; margin-bottom: 20px;">King Road App</h1>
      <button (click)="onTagVideosClick()"
              style="padding: 12px 25px; font-size: 18px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background-color 0.3s ease;">
        פתח מצלמה וטען מטא-דאטה
      </button>

      <!-- Area to display received metadata -->
      <div *ngIf="cameraID" style="margin-top: 30px; padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9; border-radius: 8px; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <h3 style="color: #555; margin-bottom: 10px;">Camera ID שהתקבל:</h3>
        <pre style="white-space: pre-wrap; word-break: break-all; font-family: monospace; background-color: #eee; padding: 10px; border-radius: 4px;">{{ cameraID }}</pre>
      </div>

      <!-- Area to display camera-related messages -->
      <div *ngIf="cameraMessage" style="margin-top: 20px; padding: 15px; border: 1px solid #ffcc00; background-color: #fffacd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <p style="color: #6a5a00;"><strong>הודעת מצלמה:</strong> {{ cameraMessage }}</p>
      </div>
    </div>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'my-webview-appcd';
  metadata: string | null = null; // Original metadata string (can be kept for debugging)
  cameraID: string | null = null; // Variable to store extracted Camera ID.
  cameraMessage: string | null = null; // Variable to display camera-related messages to the user.

  constructor() {
    // Expose functions to the window object so Kotlin code can call them.
    // bind(this) ensures that 'this' context inside the function refers to the component.
    (window as any).onCameraSuccess = this.onCameraSuccess.bind(this);
    (window as any).onCameraFailure = this.onCameraFailure.bind(this);
    (window as any).onMetadataReceived = this.onMetadataReceived.bind(this); // Expose the new function.
  }

  /**
   * Callback executed when the camera activity is launched successfully by Android,
   * but no specific metadata was loaded (e.g., user navigated back).
   */
  onCameraSuccess(): void {
    console.log("Camera activity launched successfully (from Android callback).");
    this.cameraMessage = "המצלמה נפתחה בהצלחה ויש סרטונים.";
    this.metadata = null; // Clear metadata if no specific data was returned.
    this.cameraID = null; // Clear CameraID as well
  }

  /**
   * Callback executed when the camera activity fails to launch or encounters an error.
   * @param errorMessage The error message received from Android.
   */
  onCameraFailure(errorMessage: string): void {
    console.error("Camera launch failed (from Android callback):", errorMessage);
    this.cameraMessage = `שגיאת מצלמה: ${errorMessage}`;
    this.metadata = null; // Clear metadata if the camera launch failed.
    this.cameraID = null; // Clear CameraID as well
  }

  /**
   * Callback executed when metadata is successfully received from the Android module.
   * This function now parses the metadata and extracts the CameraID.
   * @param metadata The metadata string passed from Android.
   */
  onMetadataReceived(metadata: string): void {
    console.log("Metadata received from Android:", metadata);
    this.metadata = metadata; // Store the full metadata string (optional, for debugging)
    this.cameraMessage = "מטא-דאטה התקבל בהצלחה.";

    try {
      // 1. Parse the outer JSON string
      const parsedMetadata = JSON.parse(metadata);

      // 2. Access the FormIdValues property, which is another JSON string
      const formIdValuesString = parsedMetadata.FormIdValues;

      // 3. Parse the FormIdValues string into an object
      const parsedFormIdValues = JSON.parse(formIdValuesString);

      // 4. Access the CameraID property
      this.cameraID = parsedFormIdValues.CameraID;
      console.log("Extracted Camera ID:", this.cameraID);

    } catch (e) {
      console.error("Error parsing metadata or extracting Camera ID:", e);
      this.cameraMessage = "שגיאה בניתוח המטא-דאטה.";
      this.cameraID = null; // Clear CameraID on error
    }
  }

  /**
   * Handles the click event for the "Tag Videos" button.
   * Attempts to call the native Android openCamera function.
   */
  onTagVideosClick(): void {
    console.log("Button clicked. Trying to call native Android code...");
    this.metadata = null; // Clear any previous metadata display.
    this.cameraID = null; // Clear previous CameraID display.
    this.cameraMessage = "מנסה לפתוח מצלמה..."; // Provide user feedback.

    // Check if the 'Android' interface and 'openCamera' function are available.
    // This ensures the code runs only within the WebView context of the app.
    if (typeof Android !== 'undefined' && Android.openCamera) {
      console.log("Android interface found. Calling openCamera().");
      // Call the Kotlin function exposed via JavascriptInterface.
      // Pass the names of the callback functions for success and failure.
      Android.openCamera('onCameraSuccess', 'onCameraFailure');
    } else {
      // Show an error if the Android interface is not available (e.g., running in a regular browser).
      console.error("Android interface is not available.");
      alert("תכונה זו זמינה רק באפליקציית King Road.");
      this.cameraMessage = "ממשק אנדרואיד אינו זמין.";
    }
  }
}
