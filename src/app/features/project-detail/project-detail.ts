import { Component } from '@angular/core';
import { ProjectCard } from "../../shared/components/project-card/project-card";
import { CommonModule } from '@angular/common';

interface TechnologyIcon {
  name: string;
  icon: string;
}
interface Project {
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  liveDemoUrl?: string;
  githubUrl?: string;
  technologyIcons?: TechnologyIcon[];
}

@Component({
  selector: 'app-project-detail',
  imports: [ProjectCard, CommonModule],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss'
})
export class ProjectDetail {
  private technologyIconMap: { [key: string]: string } = {
    'Angular': 'devicon-angularjs-plain colored',
    'HTML5': 'devicon-html5-plain colored',
    'CSS3': 'devicon-css3-plain colored',
    'JavaScript': 'devicon-javascript-plain colored',
    'TypeScript': 'devicon-typescript-plain colored',
    'React': 'devicon-react-original colored',
    'Node.js': 'devicon-nodejs-plain colored',
    'Express': 'devicon-express-original colored',
    'Spring Boot': 'devicon-spring-plain colored',
    'Java': 'devicon-java-plain colored',
    'Python': 'devicon-python-plain colored',
    'SQL': 'fa-solid fa-database',
    'MongoDB': 'devicon-mongodb-plain colored',
    'PostgreSQL': 'devicon-postgresql-plain colored',
    'Git': 'devicon-git-plain colored',
    'SCSS': 'devicon-sass-original colored',
    'Firebase': 'devicon-firebase-plain colored',
    // Puedes añadir más tecnologías aquí
  };

  projects: Project[] = [];

  constructor() { }

  ngOnInit(): void {
    const rawProjects: Project[] = [
        {
        title: 'Portfolio', 
        description: 'Desarrollo completo de este mismo portfolio en el que muestro informacion sobre mi aprovechando mis conocimientos de frontend', // Misma descripción
        imageUrl: 'assets/images/portfolio2.png', 
        technologies: ['Angular', 'TypeScript','HTML5', 'SCSS', 'Git'], 
        liveDemoUrl: 'https://demo.elearning-platform.com',
        githubUrl: 'https://github.com/Algoniet/elearning-platform'
      },
      {
        title: 'Plataforma de E-learning',
        description: 'Desarrollo completo de una plataforma de aprendizaje en línea con autenticación de usuarios, gestión de cursos y seguimiento de progreso. Integración de API de terceros para contenido multimedia.',
        imageUrl: 'https://placehold.co/600x400/9e0059/ffffff?text=E-learning',
        technologies: ['Angular', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'SCSS'],
        liveDemoUrl: 'https://demo.elearning-platform.com',
        githubUrl: 'https://github.com/Algoniet/elearning-platform'
      },
      {
        title: 'Sistema de Gestión de Clientes (CRM)',
        description: 'Aplicación web para la gestión de relaciones con clientes, permitiendo registrar contactos, empresas, y actividades. Incluye un dashboard interactivo y funciones de búsqueda avanzada.',
        imageUrl: 'https://placehold.co/600x400/007FFF/ffffff?text=CRM',
        technologies: ['React', 'JavaScript', 'Spring Boot', 'Java', 'PostgreSQL', 'Git'],
        liveDemoUrl: 'https://demo.crm-system.com',
        githubUrl: 'https://github.com/Algoniet/crm-system'
      },
      {
        title: 'Blog Personal Minimalista',
        description: 'Un blog personal simple y elegante con sistema de publicación de posts basado en Markdown, comentarios y autenticación de administradores. Diseñado para una carga rápida y SEO optimizado.',
        imageUrl: 'https://placehold.co/600x400/40e0d0/ffffff?text=Blog',
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
        liveDemoUrl: 'https://demo.personal-blog.com',
        githubUrl: 'https://github.com/Algoniet/minimal-blog'
      },
      {
        title: 'Aplicación de Recetas Interactivas',
        description: 'Permite a los usuarios buscar, guardar y compartir recetas. Implementa filtros por ingredientes y categorías, y ofrece una interfaz intuitiva para añadir nuevas recetas.',
        imageUrl: 'https://placehold.co/600x400/FFA500/ffffff?text=Recetas',
        technologies: ['Angular', 'TypeScript', 'Firebase', 'HTML5', 'CSS3'],
        liveDemoUrl: 'https://demo.recipes-app.com',
        githubUrl: 'https://github.com/Algoniet/recipes-app'
      },
      {
        title: 'Juego de Plataformas 2D',
        description: 'Un pequeño juego de plataformas desarrollado con Phaser 3. Incluye niveles, coleccionables, y mecánicas de salto y movimiento. Enfocado en la optimización del rendimiento del juego.',
        imageUrl: 'https://placehold.co/600x400/800080/ffffff?text=Juego+2D',
        technologies: ['JavaScript', 'HTML5', 'CSS3'],
        liveDemoUrl: 'https://demo.platformer-game.com',
        githubUrl: 'https://github.com/Algoniet/platformer-game'
      },
    ];

    this.projects = rawProjects.map(project => ({
      ...project,
      technologyIcons: project.technologies
        .map(techName => ({
          name: techName,
          icon: this.technologyIconMap[techName] || 'fa-solid fa-code'
        }))
        .filter(tech => tech.icon !== undefined) 
    }));
  }
}
