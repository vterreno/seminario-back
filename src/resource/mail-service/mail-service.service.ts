import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailServiceService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },

    });
  }

async sendMail(to: string) {
    const codigo = 123456; // ejemplo de código, puede ser generado dinámicamente

    // La ruta del archivo se resuelve usando la ubicación del archivo compilado.
    // Asegúrate de que email-template.html se copie a la carpeta 'dist'
    // configurando 'assets' en tu nest-cli.json.
    const templatePath = path.join(__dirname, 'email-template.html');

    try {
      let htmlContent = fs.readFileSync(templatePath, 'utf8');

      // Replace the placeholder in the template with the dynamic code
      htmlContent = htmlContent.replace('{{codigo}}', codigo.toString());

      const mailOptions = {
        from: '"MatePymes" <matepymer@zohomail.com>',
        to,
        subject: "Codigo de Seguridad",
        html: htmlContent,
        text: "Hola Ignacio, aquí tienes tu código de verificación para completar tu inicio de sesión de forma segura.\nCódigo: 123456\nEste código expirará en 10 minutos.",
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (err) {
      console.error('Error al enviar correo:', err);
      // Es muy probable que el error sea que el archivo no fue encontrado (ENOENT).
      throw new Error('No se pudo enviar el correo. Verifique que el archivo de plantilla exista y esté configurado como un asset en nest-cli.json.');
    }
  }
}
