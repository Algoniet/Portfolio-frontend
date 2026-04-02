import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCard } from "../../shared/components/project-card/project-card";
import { GithubService } from '../../core/services/github/github.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-project-detail',
  imports: [ProjectCard, CommonModule],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss'
})
export class ProjectDetail implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    this.loadProjects();
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