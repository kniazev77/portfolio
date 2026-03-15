function LanguageToggle({ language, onChange }) {
  return (
    <div className="language-toggle" role="group" aria-label="Language selector">
      <button
        type="button"
        className={language === 'es' ? 'active' : ''}
        onClick={() => onChange('es')}
      >
        ES
      </button>
      <button
        type="button"
        className={language === 'en' ? 'active' : ''}
        onClick={() => onChange('en')}
      >
        EN
      </button>
    </div>
  )
}

export default LanguageToggle
