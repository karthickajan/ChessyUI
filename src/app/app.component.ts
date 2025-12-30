import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  selectedFile: File | null = null;
  chessUrl: string | null = null;
  isProcessing: boolean = false;
  isCameraOn = false;
  stream: MediaStream | null = null;
  
  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement> | undefined;
  @ViewChild('canvasElement') canvasElement: ElementRef<HTMLCanvasElement> | undefined;

  private apiUrl = environment.URL;

  constructor(private http: HttpClient) {}

  ngOnDestroy(): void {
    this.stopCamera();
  }

  // Handle file selection from input
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.chessUrl = null; // Reset result
    }
  }

  // Toggle camera on/off
  async toggleCamera(): Promise<void> {
    if (this.isCameraOn) {
      this.stopCamera();
    } else {
      await this.startCamera();
    }
  }

  private async startCamera(): Promise<void> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        this.isCameraOn = true;
        this.selectedFile = null; // Clear previous selection
        this.chessUrl = null;
        // Use a timeout to ensure the video element is available after *ngIf
        setTimeout(() => {
          if (this.videoElement) {
            this.videoElement.nativeElement.srcObject = this.stream;
          }
        });
      } else {
        alert('Your browser does not support camera access.');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access the camera. Please ensure you have given permission.');
    }
  }

  private stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.isCameraOn = false;
      this.stream = null;
    }
  }

  // Capture a photo from the video stream
  capturePhoto(): void {
    if (!this.videoElement || !this.canvasElement) {
      console.error('Video or canvas element not found.');
      return;
    }
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Create a file from the canvas image
      canvas.toBlob((blob) => {
        if (blob) {
          this.selectedFile = new File([blob], `capture-${new Date().toISOString()}.png`, { type: 'image/png' });
          this.stopCamera(); // Turn off camera after capture
        }
      }, 'image/png');
    }
  }

  // Upload the selected file (from upload or camera)
  processImage(): void {
    if (!this.selectedFile) {
      alert('Please select an image or capture a photo first.');
      return;
    }
    
    console.log('� Processing image:', this.selectedFile.name);
    this.isProcessing = true;
    this.chessUrl = null; // Reset previous result
    
    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.http.post<any>(`${this.apiUrl}/upload`, formData).subscribe(
      (response) => {
        console.log('✅ Image processed successfully:', response);
        this.isProcessing = false;
        
        if (response.chess_url) {
          this.chessUrl = response.chess_url;
        } else {
          alert('Image processed, but no chess URL was returned.');
        }
      },
      (error) => {
        console.error('❌ Error processing image:', error);
        this.isProcessing = false;
        alert('Error processing image. Check console for details.');
      }
    );
  }

  // Open the chess URL in a new tab
  openChessUrl(): void {
    if (this.chessUrl) {
      window.open(this.chessUrl, '_blank');
    }
  }

  // Copy chess URL to clipboard
  copyChessUrl(): void {
    if (this.chessUrl) {
      navigator.clipboard.writeText(this.chessUrl).then(() => {
        alert('Chess URL copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy URL:', err);
      });
    }
  }
}