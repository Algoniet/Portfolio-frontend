import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface TechnologyIcon {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-project-card',
  imports: [CommonModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss'
})
export class ProjectCard {
  @Input() title: string = 'Título del Proyecto';
  @Input() description: string = 'Breve descripción del proyecto, sus objetivos y lo que hace.';
  @Input() imageUrl: string = 'assets/images/default-project.jpg';
  @Input() technologies: string[] = ['Angular', 'TypeScript', 'SCSS'];
  @Input() technologyIcons?: TechnologyIcon[] = [];
  @Input() liveDemoUrl?: string;
  @Input() githubUrl?: string;  

}
