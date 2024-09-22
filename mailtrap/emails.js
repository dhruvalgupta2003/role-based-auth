import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplate.js"
import { mailtrapClient, sender } from "./mailtrap.config.js"

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from:sender,
            to: recipient,
            subject:"Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })
        console.log("Verification Email sent successfully!!", response);
        
    } catch (error) {
        console.log(`Error sending verification Email: ${error}`)
        throw new Error(`Error sending verification Email: ${error}`)
    }
}

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{email}];
    try {
        const response = await mailtrapClient.send({
            from:sender,
            to:recipient,
            template_uuid: "1ad09aac-b748-48cc-9bf5-69422ff7aac9",
            template_variables: {
            "company_info_name": "Test_Company_info_name",
            "name": "Test_Name",
            "company_info_address": "Test_Company_info_address",
            "company_info_city": "Test_Company_info_city",
            "company_info_zip_code": "Test_Company_info_zip_code",
            "company_info_country": "Test_Company_info_country"
            }
        })
        console.log("Welcome Email sent successfully!!", response);
        
    } catch (error) {
        console.log(`Error sending Welcome Email: ${error}`)
        throw new Error(`Error sending Welcome Email: ${error}`)
    }
}