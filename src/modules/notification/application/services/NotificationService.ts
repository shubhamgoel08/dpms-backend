import {Injectable, Logger} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import {Transporter} from 'nodemailer'

export interface IAppointmentNotificationData {
  doctorEmail: string
  doctorName: string
  patientId: number
  appointmentDate: string
  startTime: string
  endTime: string
  reason?: string
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)
  private readonly transporter: Transporter

  constructor(private readonly configService: ConfigService) {
    this.transporter = this.createTransporter()
  }

  async sendAppointmentConfirmationToDoctor(data: IAppointmentNotificationData): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('mail.from'),
      to: data.doctorEmail,
      subject: 'New Appointment Confirmed',
      html: this.buildAppointmentConfirmationEmail(data),
    }

    try {
      await this.transporter.sendMail(mailOptions)
      this.logger.log(`Appointment confirmation sent to ${data.doctorEmail}`)
    } catch (error) {
      this.logger.error(`Failed to send email to ${data.doctorEmail}`, error)
    }
  }

  async sendAppointmentCancellationToDoctor(
    doctorEmail: string,
    doctorName: string,
    appointmentDate: string,
    startTime: string,
    cancellationReason?: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('mail.from'),
      to: doctorEmail,
      subject: 'Appointment Cancelled',
      html: this.buildCancellationEmail(doctorName, appointmentDate, startTime, cancellationReason),
    }

    try {
      await this.transporter.sendMail(mailOptions)
      this.logger.log(`Cancellation notification sent to ${doctorEmail}`)
    } catch (error) {
      this.logger.error(`Failed to send cancellation email to ${doctorEmail}`, error)
    }
  }

  private createTransporter(): Transporter {
    return nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: false,
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.password'),
      },
    })
  }

  private buildAppointmentConfirmationEmail(data: IAppointmentNotificationData): string {
    const reasonSection = data.reason
      ? `<div class="detail-row">
           <span class="label">Reason:</span>
           <span>${data.reason}</span>
         </div>`
      : ''

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Appointment</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 24px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 16px;
          }
          .details-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 16px;
            margin: 16px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #64748b;
          }
          .footer {
            text-align: center;
            padding: 16px;
            color: #94a3b8;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Appointment Confirmed</h1>
          </div>
          <div class="content">
            <p class="greeting">Dear ${data.doctorName},</p>
            <p>A new appointment has been scheduled with the following details:</p>
            
            <div class="details-card">
              <div class="detail-row">
                <span class="label">Date</span>
                <span>${data.appointmentDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time</span>
                <span>${data.startTime} - ${data.endTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">Patient ID</span>
                <span>#${data.patientId}</span>
              </div>
              ${reasonSection}
            </div>
            
            <p>Please ensure you are available at the scheduled time.</p>
            <p>Best regards,<br>Doctor-Patient Management System</p>
          </div>
          <div class="footer">
            This is an automated message. Please do not reply.
          </div>
        </div>
      </body>
      </html>
    `
  }

  private buildCancellationEmail(
    doctorName: string,
    appointmentDate: string,
    startTime: string,
    cancellationReason?: string,
  ): string {
    const reasonSection = cancellationReason
      ? `<p><strong>Reason:</strong> ${cancellationReason}</p>`
      : ''

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: #dc2626;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            padding: 20px;
            background: white;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Appointment Cancelled</h1>
        </div>
        <div class="content">
          <p>Dear ${doctorName},</p>
          <p>An appointment scheduled for <strong>${appointmentDate}</strong> at <strong>${startTime}</strong> has been cancelled.</p>
          ${reasonSection}
          <p>Best regards,<br>Doctor-Patient Management System</p>
        </div>
      </body>
      </html>
    `
  }
}
