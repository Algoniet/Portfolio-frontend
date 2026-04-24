import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Contact } from './features/contact/contact/contact';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Contact],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'portfolio';
  constructor(translate: TranslateService) {
    // Idiomas disponibles
    translate.addLangs(['es', 'en' , 'pt']);

    // Intentar usar el idioma del navegador
    const browserLang = translate.getBrowserLang();
    const lang = browserLang?.match(/es|en/) ? browserLang : 'es';
    translate.use(lang);
  }
}
