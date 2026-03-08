import { useTranslation } from "react-i18next";
import "./Footer.css";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <p>{t("footer.copyright")}</p>
      <p>
        {t("footer.poweredby", { defaultValue: "Powered by EnergyPredict" })}
      </p>
      <p>
        {t("footer.contact", {
          defaultValue: "Contact: bntmurua@gmail.com",
        })}
      </p>
    </footer>
  );
}
