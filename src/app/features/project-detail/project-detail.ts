import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCard } from "../../shared/components/project-card/project-card";
import { Project } from '../../core/models/project.model';
import { GithubService } from 'src/app/core/services/github/github.service';

@Component({
  selector: 'app-project-detail',
  imports: [ProjectCard, CommonModule],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css'
})
export class ProjectDetail implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Carousel properties
  currentIndex = 0;
  visibleCards = 3;

  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    this.loadProjects();
    this.updateVisibleCards();
  }

  get maxIndex(): number {
    return Math.max(0, this.projects.length - this.visibleCards);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateVisibleCards();
  }

  private updateVisibleCards(): void {
    const width = window.innerWidth;
    if (width >= 1200) {
      this.visibleCards = 3;
    } else if (width >= 768) {
      this.visibleCards = 2;
    } else {
      this.visibleCards = 1;
    }
    // Adjust current index if out of bounds
    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextSlide(): void {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    }
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  private loadProjects(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.githubService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.errorMessage = 'No se pudieron cargar los proyectos desde GitHub. Mostrando proyectos locales.';
        this.projects = this.githubService.getFallbackProjects();
        this.isLoading = false;
      }
    });

    // Subscribe to error state from service
    this.githubService.error$.subscribe(error => {
      if (error) {
        this.errorMessage = error;
      }
    });
  }

  /**
   * Retry loading projects
   */
  retryLoad(): void {
    this.githubService.clearCache();
    this.loadProjects();
  }
}