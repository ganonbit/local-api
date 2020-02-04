const verificationEmail = (verifyLink, newUser) => {
 return (
  `<body
    style="padding: 0px;margin: 0 auto !important;-webkit-text-size-adjust: 100% !important;-ms-text-size-adjust: 100% !important;-webkit-font-smoothing: antialiased !important;">
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
      style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
      <tr>
        <td style="border-collapse: collapse;mso-line-height-rule: exactly;">
          <table align="center" width="487" border="0" cellpadding="0" cellspacing="0"
            style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
            <tr>
              <td style="border-collapse: collapse;mso-line-height-rule: exactly;">
                <!-- == Header Section == -->
              </td>
            </tr>
            <tr>
              <td style="background: #8fc42c;padding: 10px;border-collapse: collapse;mso-line-height-rule: exactly;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0"
                  style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                  <tr>
                    <td align="left" style="border-collapse: collapse;mso-line-height-rule: exactly;">
                      <a href="#" style="border-collapse: collapse;mso-line-height-rule: exactly;"><img width="53"
                          src="https://res.cloudinary.com/weare270b/image/upload/v1576828740/email/avo-logo_csi56f.png"
                          alt="" style="border: 0 !important;outline: none !important;"></a>
                    </td>
                    <td align="right" style="border-collapse: collapse;mso-line-height-rule: exactly;">
                      <table border="0" cellpadding="0" cellspacing="0"
                        style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                        <tr>
                          <td
                            style="font-size: 16px;color: #ffffff;font-weight: bold;font-family: 'Roboto Condensed', Arial, sans-serif;padding-right: 10px;border-collapse: collapse;mso-line-height-rule: exactly;">
                            ${newUser.firstName} ${newUser.lastName}</td>
                          <td style="border-collapse: collapse;mso-line-height-rule: exactly;"><img width="40"
                              src="https://res.cloudinary.com/weare270b/image/upload/v1576220262/static/q_auto/Image_from_iOS_1_bnaxnc.jpg"
                              alt="" style="border: 0 !important;outline: none !important;"></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- == //Header Section == -->

            <!-- == Body Section == -->
            <tr>
              <td valign="top"
                style="padding-top: 25px;border: 1px solid #dee4e4;border-collapse: collapse;mso-line-height-rule: exactly;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0"
                  style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                  <tr>
                    <td
                      style="font-size: 18px;color: #4b4d4c;font-weight: bold;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 20px;border-collapse: collapse;mso-line-height-rule: exactly;">
                      Hola, ${newUser.firstName}!</td>
                  </tr>
                  <tr>
                    <td
                      style="font-size: 18px;color: #4b4d4c;font-weight: normal;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 20px;border-collapse: collapse;mso-line-height-rule: exactly;">
                      Welcome to Avocado Nation - the first ever online community for avocado lovers!
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="font-size: 18px;color: #4b4d4c;font-weight: normal;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 10px;border-collapse: collapse;mso-line-height-rule: exactly;">
                      You can log in to your account here:
                    </td>
                  </tr>
                  <tr>
                    <td align="center"
                      style="padding: 0 25px 16px;border-collapse: collapse;mso-line-height-rule: exactly;">
                      <table border="0" cellpadding="0" cellspacing="0"
                        style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                        <tr>
                          <td
                            style="width: 200px;height: 50px;border: 2px solid #9ac14a;text-align: center;border-collapse: collapse;mso-line-height-rule: exactly;">
                            <a style="font-size: 20px;color: #9ac14a;text-decoration: none;font-family: 'Roboto Condensed', Arial, sans-serif;font-weight: 700;display: block;padding: 16px;border-radius: 3px;border-collapse: collapse;mso-line-height-rule: exactly;"
                              href="${verifyLink}">VERIFY</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="font-size: 18px;color: #4b4d4c;font-weight: normal;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 20px;border-collapse: collapse;mso-line-height-rule: exactly;">
                      Now what are you waiting for?! Share your avocado love!
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="font-size: 18px;color: #4b4d4c;font-weight: normal;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 5px;border-collapse: collapse;mso-line-height-rule: exactly;">
                      See you soon!
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="font-size: 18px;color: #4b4d4c;font-weight: bold;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 30px;border-collapse: collapse;mso-line-height-rule: exactly;">
                      Selma!
                    </td>
                  </tr>
                  <tr>
                    <td style="border-collapse: collapse;mso-line-height-rule: exactly;">
                      <table width="100%" border="0" cellpadding="0" cellspacing="0"
                        style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                        <tr>
                          <td width="136" style="width: 136px;border-collapse: collapse;mso-line-height-rule: exactly;">
                            <img width="136" height="137"
                              src="https://res.cloudinary.com/weare270b/image/upload/v1576828740/email/avatar-img2_jjodo2.png"
                              alt="" style="border: 0 !important;outline: none !important;">
                          </td>
                          <td width="351"
                            style="width: 351px;height: 117px;padding: 10px 60px;background: #40904b;border-collapse: collapse;mso-line-height-rule: exactly;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0"
                              style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                              <tr>
                                <td
                                  style="font-size: 30px;color: #ffffff;font-weight: 700;font-family: 'Roboto Condensed', Arial, sans-serif;padding-bottom: 5px;border-collapse: collapse;mso-line-height-rule: exactly;">
                                  Selma Avocado</td>
                              </tr>
                              <tr>
                                <td
                                  style="font-size: 16px;color: #8fbf2f;font-weight: normal;font-family: 'Roboto Condensed', Arial, sans-serif;font-style: italic;border-collapse: collapse;mso-line-height-rule: exactly;">
                                  The Self-Professed Avo Geek</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- == //Body Section == -->

            <!-- == Footer Section == -->
            <tr>
              <td style="padding: 20px 50px;background: #f3f5f4;border-collapse: collapse;mso-line-height-rule: exactly;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0"
                  style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                  <tr>
                    <td align="center"
                      style="font-size: 16px;text-align: center;padding-bottom: 25px;font-family: 'Roboto Condensed', Arial, sans-serif;border-collapse: collapse;mso-line-height-rule: exactly;">
                      You are receiving Avocado Nation notification emails.
                    </td>
                  </tr>
                  <tr>
                    <td align="center"
                      style="font-size: 16px;text-align: center;padding-bottom: 25px;font-family: 'Roboto Condensed', Arial, sans-serif;border-collapse: collapse;mso-line-height-rule: exactly;">
                      This email was intended for ${newUser.firstName} ${newUser.lastName}.
                    </td>
                  </tr>
                  <tr>
                    <td align="center"
                      style="padding-bottom: 5px;border-collapse: collapse;mso-line-height-rule: exactly;">
                      <img width="130"
                        src="https://res.cloudinary.com/weare270b/image/upload/v1576828740/email/avonation-logo_g1oi9v.png"
                        alt="" style="border: 0 !important;outline: none !important;">
                    </td>
                  </tr>
                  <tr>
                    <td align="center"
                      style="font-size: 16px;text-align: center;font-family: 'Roboto Condensed', Arial, sans-serif;padding-bottom: 5px;border-collapse: collapse;mso-line-height-rule: exactly;">
                      © 2019 Avocado Nation
                    </td>
                  </tr>
                  <tr>
                    <td align="center"
                      style="font-size: 16px;text-align: center;font-family: 'Roboto Condensed', Arial, sans-serif;border-collapse: collapse;mso-line-height-rule: exactly;">
                      222 West Las Colinas Boulevard Suite 850E, Irving, TX 75039.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- == //Footer Section == -->
          </table>
        </td>
      </tr>
    </table>
  </body>`
 ) 
}

export default verificationEmail