import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

@Component({
    selector: 'app-coach',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent],
    templateUrl: './coach.html',
    styleUrl: './coach.scss'
})
export class CoachComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    username: string | null = null;
    userEmail: string | null = null;

    messages: ChatMessage[] = [];
    inputMessage: string = '';
    isLoading: boolean = false;
    sessionId: number | null = null;
    error: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.username = params['username'];
        });

        if (isPlatformBrowser(this.platformId)) {
            this.userEmail = localStorage.getItem('userEmail');
            if (this.userEmail) {
                this.loadRecentSession();
            }
        }

        // Welcome message
        if (this.messages.length === 0) {
            this.messages.push({
                role: 'assistant',
                content: "Bonjour! Je suis votre Coach Nutrition IA. Comment puis-je vous aider aujourd'hui? Posez-moi des questions sur vos repas, vos objectifs ou la nutrition en général."
            });
        }
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            if (this.scrollContainer) {
                this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            }
        } catch (err) { }
    }

    loadRecentSession() {
        this.http.get<any[]>(`/api/chat/sessions?email=${encodeURIComponent(this.userEmail || '')}`).subscribe({
            next: (sessions) => {
                if (sessions && sessions.length > 0) {
                    // Load the most recent session
                    // Assuming backend sorts by date desc
                    const lastSession = sessions[0];
                    this.sessionId = lastSession.id;
                    this.loadMessages(lastSession.id);
                }
            },
            error: (e) => console.error('Failed to load sessions', e)
        });
    }

    loadMessages(sessionId: number) {
        this.http.get<any>(`/api/chat/session/${sessionId}`).subscribe({
            next: (session) => {
                if (session && session.messages) {
                    this.messages = session.messages.map((m: any) => ({
                        role: m.role,
                        content: m.content
                    }));
                    this.scrollToBottom();
                }
            }
        });
    }

    sendMessage() {
        if (!this.inputMessage.trim() || this.isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: this.inputMessage };
        this.messages.push(userMsg);

        const payload = {
            email: this.userEmail,
            message: this.inputMessage,
            sessionId: this.sessionId
        };

        this.inputMessage = '';
        this.isLoading = true;
        this.error = null;

        this.http.post<any>('/api/coach/send', payload).subscribe({
            next: (response) => {
                this.isLoading = false;
                if (response.reply) {
                    this.messages.push({ role: 'assistant', content: response.reply });
                    if (response.session_id) {
                        this.sessionId = response.session_id; // saving session ID for next turn
                    }
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.error = "Désolé, je n'ai pas pu joindre le coach. Veuillez réessayer.";
                console.error(err);
            }
        });
    }
}
