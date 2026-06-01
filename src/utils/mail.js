import Mailgen from "mailgen"
import nodemailer from "nodemailer"

const sendEmail=async(options)=>{
    const mailgenerator=new Mailgen({
        theme:"default",
        product:{
            name:"My App",
            link: process.env.FRONTEND_URL || "http://localhost:8000"
        }
    })

   const emailTextual = mailgenerator.generatePlaintext(options.mailgenContent)
   const emailHtml = mailgenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
     host: process.env.MAILTRAP_SMTP_HOST,
     port: parseInt(process.env.MAILTRAP_SMTP_PORT),
     secure: false,
     auth: {
          user: process.env.MAILTRAP_SMTP_USERNAME,
          pass: process.env.MAILTRAP_SMTP_PASSWORD
     }
    })
    const mail ={
        from : "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }
    try{
        await transporter.sendMail(mail)
    }catch(error){
        
        console.error("Error sending email.Make sure that you have provided your mailtrap credentials in the .env file ")
        console.error("error", error)
    }
}
const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome! Please verify your email.",
      action: {
        instructions: "Click the button below to verify your email:",
        button: {
          color: "#22BC66",
          text: "Verify Email",
          link: verificationUrl,
        },
      },
      outro: "If you did not create this account, please ignore this email.",
    },
  };
};
const forgotPasswordMailgenContent = (username, resetPasswordUrl) => {
    return{
        body:{
            name:username,
            intro:"You have received this email because a password reset request for your account was received.",
            action:{
                instructions:"To reset your password, please click here:",
                button:{
                    color:"#DC4D2F", // Optional action button color
                    text:"Reset your password",
                    link:resetPasswordUrl
                }
            },
            outro:"If you did not request a password reset, no further action is required on your part."
    }   
   }
}

export { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent }
