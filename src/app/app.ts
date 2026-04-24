import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Contact } from './features/contact/contact/contact';
import { BgParticles } from './shared/components/bg-particles/bg-particles';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Contact, BgParticles],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'portfolio';
  constructor(private translate: TranslateService) {
    // Idiomas disponibles
    translate.addLangs(['es', 'en' , 'pt']);

    // Intentar usar el idioma del navegador
    const browserLang = translate.getBrowserLang();
    const lang = browserLang?.match(/es|en/) ? browserLang : 'es';
    translate.use(lang);
  }
}
