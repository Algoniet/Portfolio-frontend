import { CommonModule } from '@angular/common';
import { Component, HostListener, NgZone, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { fromEvent, Subscription, throttleTime } from 'rxjs';
import { ContactModalService } from '../../../features/contact/contact-modal.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink,RouterLinkActive,CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit,OnDestroy {

  constructor(
    private ngZone: NgZone,
    private contactModalService: ContactModalService,
    private elementRef: ElementRef
  ) { }

  /**
   * Cierra el dropdown al hacer clic fuera de él.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeLangDropdown();
    }
  }

  isMenuHiddenByScroll: boolean = false;
  isManuallyOpened: boolean = false;

  // Estado del tema (oscuro por defecto)
  isDarkMode: boolean = true;

  // Idioma actual (códigos de visualización: ESP, EN, PT)
  currentLang: string = 'ESP';

  // Estado del dropdown de idioma
  isLangDropdownOpen: boolean = false;

  // URLs de banderas (cdn flagcdn)
  flagUrls: { [key: string]: string } = {
    'ESP': 'https://flagcdn.com/w40/es.png',
    'EN': 'https://flagcdn.com/w40/gb.png',
    'PT': 'https://flagcdn.com/w40/br.png'
  };

  // Mapa interno para localStorage/API
  private langCodeMap: { [key: string]: string } = {
    'ESP': 'ES',
    'EN': 'EN',
    'PT': 'PT'
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

    // Cargar preferencias guardadas
    this.loadPreferences();

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

  /**
   * Abre el modal de contacto.
   */
  openContactModal(): void {
    this.contactModalService.openContactModal();
  }

  /**
   * Cambia entre tema claro y oscuro.
   */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('light-mode', !this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  /**
   * Abre/cierra el dropdown de idioma.
   */
  toggleLangDropdown(event: Event): void {
    event.stopPropagation();
    this.isLangDropdownOpen = !this.isLangDropdownOpen;
  }

  /**
   * Cierra el dropdown de idioma.
   */
  closeLangDropdown(): void {
    this.isLangDropdownOpen = false;
  }

  /**
   * Obtiene la URL de la bandera del idioma actual.
   */
  getCurrentFlagUrl(): string {
    return this.flagUrls[this.currentLang] || this.flagUrls['ESP'];
  }

  /**
   * Establece el idioma seleccionado.
   */
  setLanguage(lang: string): void {
    this.currentLang = lang;
    // Guardar el código interno en localStorage
    const storageCode = this.langCodeMap[lang] || lang;
    localStorage.setItem('lang', storageCode);
    this.isLangDropdownOpen = false;
    // Aquí se implementaría la lógica de cambio de idioma real
    console.log('Idioma cambiado a:', this.currentLang);
  }

  /**
   * Carga las preferencias guardadas del usuario.
   */
  private loadPreferences(): void {
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('lang');

    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
      document.body.classList.toggle('light-mode', !this.isDarkMode);
    }

    if (savedLang) {
      // Convertir código de almacenamiento a código de visualización
      const displayMap: { [key: string]: string } = {
        'ES': 'ESP',
        'EN': 'EN',
        'PT': 'PT'
      };
      this.currentLang = displayMap[savedLang] || savedLang;
    }
  }
}
