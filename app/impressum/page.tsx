export default function Impressum() {
    return (
        <div className="min-h-screen bg-black text-white p-8 md:p-24 font-[family-name:var(--font-dm)]">
            <h1 className="text-4xl font-[family-name:var(--font-outfit)] font-bold mb-8 text-blue-200">Impressum</h1>
            <div className="max-w-3xl space-y-6 text-white/70">
                <p><strong>Angaben gemäß § 5 TMG</strong><br />Schwerelos GmbH<br />Musterstraße 1<br />85049 Ingolstadt</p>
                <p><strong>Vertreten durch:</strong><br />Max Mustermann</p>
                <p><strong>Kontakt</strong><br />Telefon: +49 (0) 123 44 55 66<br />E-Mail: info@schwerelos-art.de</p>
                <p><strong>Registereintrag:</strong><br />Eintragung im Handelsregister.<br />Registergericht: Amtsgericht Ingolstadt<br />Registernummer: HRB 12345</p>
                <p><strong>Umsatzsteuer-ID:</strong><br />Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz: DE 123456789</p>
            </div>
        </div>
    );
}
