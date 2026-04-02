import { CommonModule } from '@angular/common';
import { Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { fromEvent, Subscription, throttleTime } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink,RouterLinkActive,CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit,OnDestroy {
 isMenuHiddenByScroll: boolean = false;
  isManuallyOpened: boolean = false;

  get isMenuEffectivelyHidden(): boolean {
    return this.isMenuHiddenByScroll && !this.isManuallyOpened;
  }

  private lastScrollY: number = 0;
  private topThreshold: number = 20;
  private scrollDetectThreshold: number = 5;

  private scrollSubscription: Subscription | undefined;
  private animationFrameId: number = 0;

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void {
    this.isMenuHiddenByScroll = false;
    this.isManuallyOpened = false;
    this.lastScrollY = window.scrollY;

    this.scrollSubscription = this.ngZone.runOutsideAngular(() => {
      return fromEvent(window, 'scroll')
        .pipe(
          throttleTime(50)
        )
        .subscribe(() => {
          if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
          }
          this.animationFrameId = requestAnimationFrame(() => {
            this.ngZone.run(() => {
              this.handleScrollLogic(window.scrollY);
            });
          });
        });
    });

    this.ngZone.run(() => {
      this.handleScrollLogic(window.scrollY);
    });
  }

  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private handleScrollLogic(currentScrollY: number): void {
    if (currentScrollY > this.topThreshold) {
      this.isMenuHiddenByScroll = true;
    } else {
      this.isMenuHiddenByScroll = false;
      this.isManuallyOpened = false;
    }

    if (this.isManuallyOpened && Math.abs(currentScrollY - this.lastScrollY) > this.scrollDetectThreshold) {
      this.isManuallyOpened = false;
    }

    this.lastScrollY = currentScrollY;
  }

  toggleMenu(): void {
    this.isManuallyOpened = !this.isManuallyOpened;

    if (this.isManuallyOpened) {
      this.isMenuHiddenByScroll = false;
    }
  }
}
