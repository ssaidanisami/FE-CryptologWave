import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageSelectorComponent } from './language-selector.component';
import { TranslationService } from '@fe-cryptolog-wave/shared-utils';

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let translationService: TranslationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSelectorComponent],
      providers: [TranslationService],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
    translationService = TestBed.inject(TranslationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default language', () => {
    expect(component.currentLanguage()).toBe('en');
  });

  it('should update translation service language when onLanguageChange is called', () => {
    component.onLanguageChange('fr');
    expect(translationService.getLanguage()).toBe('fr');
    expect(component.currentLanguage()).toBe('fr');

    component.onLanguageChange('en');
    expect(translationService.getLanguage()).toBe('en');
    expect(component.currentLanguage()).toBe('en');
  });
});
