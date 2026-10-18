import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { TranslationService, Language } from '@fe-cryptolog-wave/shared-utils';

export interface LanguageOption {
  label: string;
  value: Language;
}

@Component({
  selector: 'lib-language-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, Select],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
})
export class LanguageSelectorComponent {
  private readonly translationService = inject(TranslationService);

  readonly languages: LanguageOption[] = [
    { label: 'English', value: 'en' },
    { label: 'Français', value: 'fr' },
  ];

  readonly currentLanguage = this.translationService.currentLanguage;

  onLanguageChange(lang: Language): void {
    if (lang) {
      this.translationService.setLanguage(lang);
    }
  }
}
