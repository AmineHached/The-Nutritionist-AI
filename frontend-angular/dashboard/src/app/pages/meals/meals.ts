import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-meals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meals.html',
  styleUrl: './meals.scss',
})
export class MealsComponent implements OnInit {
  username: string | null = null;
  userEmail: string | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isAnalyzing: boolean = false;
  analysisResult: any = null;
  error: string | null = null;
  history: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.username = params['username'];
    });

    // Get user email from localStorage (Browser only)
    if (isPlatformBrowser(this.platformId)) {
      // Try a few common keys for stored email
      this.userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email') || localStorage.getItem('user') || null;
      console.log('MealsComponent: detected userEmail from localStorage:', this.userEmail);
      if (this.userEmail) {
        this.loadHistory();
      }
    }
  }

  loadHistory(): void {
    if (!this.userEmail) return;
    console.log('Loading history for email=', this.userEmail);
    this.http.get<any[]>('/api/history/by-email', { params: { email: this.userEmail } }).subscribe({
      next: (data) => {
        console.log('History loaded:', data);
        this.history = data || [];
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.history = [];
      }
    });
  }

  triggerCamera(): void {
    const fileInput = document.getElementById('cameraInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.previewFile(file);
      this.analyzeImage(file);
    }
  }

  previewFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  analyzeImage(file: File): void {
    this.isAnalyzing = true;
    this.analysisResult = null;
    this.error = null;

    const formData = new FormData();
    formData.append('file', file);

    // Pass user email as query param
    const email = this.userEmail || 'user@example.com';
    console.log('Analyzing image for email=', email);

    this.http.post<any>(`/api/ai/analyze?user_email=${encodeURIComponent(email)}`, formData).subscribe({
      next: (response) => {
        console.log('AI Analysis Result:', response);
        try {
          if (typeof response === 'string') {
            const trimmed = response.trim();
            if (trimmed.startsWith('<')) {
              // Server returned HTML (likely an error page or index.html)
              throw new Error('Server returned HTML instead of JSON');
            }
            this.analysisResult = JSON.parse(response);
          } else {
            this.analysisResult = response;
          }
          this.isAnalyzing = false;
          // Reload history after successful analysis
          this.loadHistory();
          // Notify other parts of the app (dashboard) that history changed
          try {
            window.dispatchEvent(new CustomEvent('history-updated', { detail: { email } }));
          } catch (e) { }
        } catch (parseErr) {
          console.error('Failed to parse AI response:', parseErr, response);
          this.analysisResult = null;
          this.error = 'Erreur lors de l\'analyse: réponse invalide du serveur.';
          this.isAnalyzing = false;
        }
      },
      error: (err) => {
        console.error('AI Analysis Error:', err);
        this.error = 'Erreur lors de l\'analyse de l\'image. Veuillez réessayer.';
        this.isAnalyzing = false;
      }
    });
  }

  addManualEntry(): void {
    alert('Fonctionnalité de saisie manuelle à venir!');
  }
}
