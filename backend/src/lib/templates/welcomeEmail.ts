export function getWelcomeEmailTemplate(
  name: string,
  email: string,
  password: string,
  title: string,
  assignedServices: string[]
): { html: string; text: string } {
  const assignedServicesList =
    assignedServices.length > 0 ? assignedServices.join(", ") : "None";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0b3d2e, #11624a); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to FECASC</h1>
      </div>
      
      <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p>Hello <strong>${name}</strong>,</p>
        
        <p>Your staff account has been created successfully! You can now access the FECASC consultant dashboard to manage your assigned projects.</p>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 12px 0;"><strong>Login Credentials:</strong></p>
          <p style="margin: 6px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 6px 0;"><strong>Password:</strong> ${password}</p>
          <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">Please change your password after your first login.</p>
        </div>
        
        <div style="margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/login" style="display: inline-block; background: #1a8f6a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Login to Dashboard
          </a>
        </div>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            <strong>Your Role:</strong> ${title}<br>
            <strong>Assigned Services:</strong> ${assignedServicesList}
          </p>
        </div>
        
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
          If you have any questions, please contact the admin team.
        </p>
      </div>
    </div>
  `;

  const text = `
Welcome to FECASC

Hello ${name},

Your staff account has been created successfully! You can now access the FECASC consultant dashboard to manage your assigned projects.

LOGIN CREDENTIALS:
Email: ${email}
Password: ${password}
Please change your password after your first login.

YOUR ROLE: ${title}
ASSIGNED SERVICES: ${assignedServicesList}

Login to Dashboard: ${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/login

If you have any questions, please contact the admin team.
  `;

  return { html, text };
}
