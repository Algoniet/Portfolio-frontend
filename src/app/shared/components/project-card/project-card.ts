import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TechnologyIcon } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-card',
  imports: [CommonModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css'
})
export class ProjectCard {
  @Input() title: string = 'Título del Proyecto';
  @Input() description: string = 'Breve descripción del proyecto, sus objetivos y lo que hace.';
  @Input() imageUrl: string = 'assets/images/default-project.jpg';
  @Input() technologies: string[] = [];
  @Input() technologyIcons?: TechnologyIcon[];
  @Input() liveDemoUrl?: string;
  @Input() githubUrl?: string;
}
