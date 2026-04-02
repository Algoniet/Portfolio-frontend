import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'home', 
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './home.html', 
  styleUrl: './home.css',   
  animations: [ 
    trigger('typewriterEffect', [
      state('void', style({ width: '0%', opacity: 0 })),
      transition(':enter', [
        animate('2s ease-out', keyframes([
          style({ width: '0%', opacity: 0, offset: 0 }),
          style({ width: '100%', opacity: 1, offset: 0.8 }),
          style({ opacity: 1, offset: 1 })
        ]))
      ])
    ])
  ]
})
export class Home implements OnInit, AfterViewInit {

  title = 'home';
  @ViewChild('experienceCard') experienceCard!: ElementRef;
  @ViewChild('projectCard') projectCard!: ElementRef;
  @ViewChild('latestSection') latestSection!: ElementRef;

  codeIntroText: string = '';
  fullText: string = 'Hello World/>';

  constructor() { } 

  ngOnInit(): void {
    this.typewriteText();
  }

  ngAfterViewInit(): void {
    
  }


  typewriteText(): void {
    let i = 0;
    const speed = 70;

    const typingInterval = setInterval(() => {
      if (i < this.fullText.length) {
        this.codeIntroText += this.fullText.charAt(i);
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);
  }
}