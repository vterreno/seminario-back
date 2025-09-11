import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { emailCodeEntity } from 'src/database/core/email-code.entity';
import { Repository } from 'typeorm';
import { compareSync, hashSync } from 'bcrypt';

@Injectable()
export class MailServiceService {
  private transporter;
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  constructor(
      @InjectRepository(emailCodeEntity)
      private readonly emailCodeRepository: Repository<emailCodeEntity>,
    ) {
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
    // Verificar si es el superadmin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@mail.com';
    if (to === superAdminEmail) {
      throw new Error('No se permite el cambio de contraseña del superadministrador por motivos de seguridad');
    }

    const codigo = this.generateCode();
    const codeHash = hashSync(codigo, 10);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000 );
    await this.emailCodeRepository.save({
      email: to,
      codigoHash: codeHash,
      expired_at: expiresAt,
    });
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

  async verifyCode(email: string, code: string): Promise<boolean> {
    const record = await this.emailCodeRepository.findOne({
      where: { email },
      order: { created_at: 'DESC' },
    });
    if (!record) {
      return false; 
    }
    if (record.expired_at < new Date()) {
      return false;
    }
    const isMatch = compareSync(code, record.codigoHash);;
    return isMatch;
  }
}
