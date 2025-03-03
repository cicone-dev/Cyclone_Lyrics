import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Sobre</h3>
          <p>Encontre letras das suas músicas favoritas.</p>
        </div>
        <div className="footer-section">
          <h3>Contato</h3>
          <p>Email: cicone.professional@gmail.com</p>
          <p>Telefone: (11) 1234-5678</p>
        </div>
        <div className="footer-section">
          <h3>Redes Sociais</h3>
          <div className="social-links">
            <a href="https://instagram.com" aria-label="Instagram">Instagram</a>
            <a href="https://twitter.com" aria-label="Twitter">Twitter</a>
            <a href="https://facebook.com" aria-label="Facebook">Facebook</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 LyricsFinder. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;