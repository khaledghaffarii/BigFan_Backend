const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "mahmoud.hadidi1@esprit.tn",
    pass: "191SMT2006PFE+ESPRIT",
  },
});

module.exports.sendConfirmationEmail = (email, activationCode) => {
  transporter
    .sendMail({
      from: "mahmoud.hdidi1@esprit.tn", // Change to your verified sender
     
      to: email, // Change to your recipient
      subject: "Confirmer Votre Compte",
      text: "and easy to do anywhere, even with Node.js",
      html: `<strong><h1> Email de Confirmation  </h1></strong>
        <h2> Bonjour </h2>
        <p> pour activer votre compte , veuillez cliquer sur ce lien  </p>
        <a href= http://localhost:3000/confirm/${activationCode}> Cliquer ici ! </a> 
        `,
    })
    .catch((err) => console.log(err));
};