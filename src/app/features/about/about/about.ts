import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  // Technologies separated by category
  frontendTechnologies = [
    { name: 'Angular', icon: 'devicon-angularjs-plain colored' },
    { name: 'TypeScript', icon: 'devicon-typescript-plain colored' },
    { name: 'JavaScript', icon: 'devicon-javascript-plain colored' },
    { name: 'HTML5', icon: 'devicon-html5-plain colored' },
    { name: 'CSS3', icon: 'devicon-css3-plain colored' },
    { name: 'Sass', icon: 'devicon-sass-original colored' },
    { name: 'Bootstrap', icon: 'devicon-bootstrap-plain colored' },
  ];

  backendTechnologies = [
    { name: 'Java', icon: 'devicon-java-plain colored' },
    { name: 'Spring', icon: 'devicon-spring-original colored' },
    { name: 'PostgreSQL', icon: 'devicon-postgresql-plain colored' },
    { name: 'MySQL', icon: 'devicon-mysql-plain colored' },
  ];

  toolsTechnologies = [
    { name: 'Git', icon: 'devicon-git-plain colored' },
    { name: 'GitHub', icon: 'devicon-github-original' },
    { name: 'Docker', icon: 'devicon-docker-plain colored' },
    { name: 'VS Code', icon: 'devicon-vscode-plain colored' },
    { name: 'Jest', icon: 'devicon-jest-plain colored' },
    { name: 'NPM', icon: 'devicon-npm-original-wordmark colored' },
    
  ];

  // Legacy - combined array
  allTechnologies = [
    ...this.frontendTechnologies,
    ...this.backendTechnologies,
    ...this.toolsTechnologies
  ];

  skills: string[] = [
    'Angular', 'TypeScript', 'JavaScript', 'Java', 'Spring Boot',
    'HTML5', 'CSS3', 'SCSS', 'RESTful APIs', 'Git', 'SVN', 'SQL',
    'AEM', 'Adobe Experience Manager', 'Responsive Design',
    'Microservicios', 'JUnit', 'Maven', 'Problem Solving',
    'Agile/Scrum', 'Teamwork', 'Communication'
  ];

  experience: { title: string, company: string, years: string, description: string[] }[] = [
    {
      title: 'Desarrollador Web Fullstack',
      company: 'PENTEC',
      years: 'Mar 2024 - Actualidad',
      description: [
        'Desarrollo fullstack utilizando Angular para el frontend y Spring (Java) en el backend.',
        'Migración completa de un servicio desde JSF a arquitectura moderna Angular + Spring Boot.',
        'Implementación de componentes dinámicos en Angular (TypeScript, HTML5, CSS3).',
        'Desarrollo y exposición de servicios REST en Java/Spring.'
      ]
    },
    {
      title: 'Desarrollador AEM/JavaScript',
      company: 'Minsait',
      years: 'Sept 2023 - Feb 2024 · 6 meses',
      description: [
        'Desarrollo de formularios interactivos en Adobe Experience Manager (AEM) y JavaScript.',
        'Optimización de la experiencia de usuario y automatización de flujos internos.',
        'Integración de formularios con servicios backend y trabajo en entornos Agile.'
      ]
    },
    {
      title: 'Desarrollador Web',
      company: 'VIEWNEXT',
      years: 'Dic 2022 - Sept 2023 · 10 meses',
      description: [
        'Desarrollo y mantenimiento de aplicaciones web con Java, Spring Boot y JavaScript.',
        'Pruebas unitarias (JUnit) y mejora continua del código.',
        'Formación técnica en Spring Boot y microservicios.'
      ]
    },
    {
      title: 'Desarrollador C# (Prácticas)',
      company: 'Ceteck',
      years: 'Mar 2022 - May 2022 · 3 meses',
      description: [
        'Desarrollo de soluciones en C# integradas con PI System.',
        'Análisis de datos industriales y visualización de indicadores en tiempo real.',
        'Trabajo en entorno ágil con tareas de mantenimiento y documentación técnica.'
      ]
    }
  ];

  education: { degree: string, institution: string, years: string }[] = [
    {
      degree: 'Grado Superior en Desarrollo de Aplicaciones Multiplataforma',
      institution: 'PROGRESA Centro de Formación Profesional',
      years: '2020 - 2022'
    },
    {
      degree: 'Técnico Superior en Mantenimiento Electrónico',
      institution: 'Juan Comenius',
      years: '2016 - 2018'
    }
  ];
}
