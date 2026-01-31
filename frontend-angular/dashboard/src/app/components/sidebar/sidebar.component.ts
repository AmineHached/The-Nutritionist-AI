import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
    @Input() username: string | null = null;

    constructor(private userService: UserService) { }

    getUserInitials(): string {
        const userData = this.userService.getUserFromStorage();
        const name = userData?.username || 'User';
        return name.substring(0, 2).toUpperCase();
    }

    getUserDisplayName(): string {
        const userData = this.userService.getUserFromStorage();
        return userData?.username || 'User';
    }
}
