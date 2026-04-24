import { CommonModule } from '@angular/common';
import { Component, HostListener, NgZone, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { fromEvent, Subscription, throttleTime } from 'rxjs';
import { ContactModalService } from '../../../features/contact/contact-modal.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {

  constructor(
    private ngZone: NgZone,
    private contactModalService: ContactModalService,
    private elementRef: ElementRef,
    private translate: TranslateService
  ) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeLangDropdown();
    }
  }

  isMenuHiddenByScroll: boolean = false;
  isManuallyOpened: boolean = false;

  isDarkMode: boolean = true;

  currentLang: string = 'ESP';

  isLangDropdownOpen: boolean = false;

  flagUrls: { [key: string]: string } = {
    'ESP': 'https://flagcdn.com/w40/es.png',
    'EN': 'https://flagcdn.com/w40/gb.png',
    'PT': 'https://flagcdn.com/w40/br.png'
  };

  private langCodeMap: { [key: string]: string } = {
    'ESP': 'es',
    'EN': 'en',
    'PT': 'pt'
  };

  private displayMap: { [key: string]: string } = {
    'es': 'ESP',
    'en': 'EN',
    'pt': 'PT'
  };

  get isMenuEffectivelyHidden(): boolean {
    return this.isMenuHiddenByScroll && !this.isManuallyOpened;
  }

  private lastScrollY: number = 0;
  private topThreshold: number = 20;
  private scrollDetectThreshold: number = 5;

  private scrollSubscription: Subscription | undefined;
  private animationFrameId: number = 0;

  ngOnInit(): void {
    this.isMenuHiddenByScroll = false;
    this.isManuallyOpened = false;
    this.lastScrollY = window.scrollY;

    this.loadPreferences();

    this.scrollSubscription = this.ngZone.runOutsideAngular(() => {
      return fromEvent(window, 'scroll')
        .pipe(throttleTime(50))
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

  openContactModal(): void {
    this.contactModalService.openContactModal();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('light-mode', !this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  toggleLangDropdown(event: Event): void {
    event.stopPropagation();
    this.isLangDropdownOpen = !this.isLangDropdownOpen;
  }

  closeLangDropdown(): void {
    this.isLangDropdownOpen = false;
  }

  getCurrentFlagUrl(): string {
    return this.flagUrls[this.currentLang] || this.flagUrls['ESP'];
  }

  setLanguage(lang: string): void {
    this.currentLang = lang;
    const translateCode = this.langCodeMap[lang] || 'es';
    this.translate.use(translateCode);
    localStorage.setItem('lang', translateCode);
    this.isLangDropdownOpen = false;
  }

  private loadPreferences(): void {
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('lang');

    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
      document.body.classList.toggle('light-mode', !this.isDarkMode);
    }

    if (savedLang && this.displayMap[savedLang]) {
      this.currentLang = this.displayMap[savedLang];
      this.translate.use(savedLang);
    } else {
      this.translate.use('es');
    }
  }
}
