import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  selectedFile: File | null = null;
  chessUrl: string | null = null;
  isProcessing: boolean = false;
  private apiUrl = environment.URL;
  constructor(private http: HttpClient) {}

  // Handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // Upload the image to the backend
  uploadImage(): void {
    console.log('🚀 uploadImage called');
    console.log('📍 API URL:', this.apiUrl);
    
    if (!this.selectedFile) {
      console.error('❌ No file selected for upload.');
      alert('Please select an image first.');
      return;
    }
    
    console.log('📁 Selected file:', this.selectedFile);
    this.isProcessing = true;
    this.chessUrl = null; // Reset previous result
    
    const formData = new FormData();
    formData.append('image', this.selectedFile);

    console.log('🔄 Starting image processing...');
    this.http.post<any>(`${this.apiUrl}/upload`, formData).subscribe(
      (response) => {
        console.log('✅ Image processed successfully:', response);
        this.isProcessing = false;
        
        if (response.chess_url) {
          this.chessUrl = response.chess_url;
          console.log('🔗 Chess URL received:', this.chessUrl);
          alert(`Image processed successfully! Chess URL: ${this.chessUrl}`);
        } else {
          console.warn('⚠️ No chess URL in response');
          alert('Image processed but no chess URL was generated.');
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