// Importing Required Libraries
const { google } = require('googleapis')
const { GoogleAuth } = require('google-auth-library')

// setting Global Variables
const projectID = 'project-ID'
const projectName = `projects/${projectID}`
const billing = google.cloudbilling('v1').projects

// Diable Billing Function 
exports.disable_Billing = async(pubsubevent) => {

    // checking if project ID exists
    if(!projectID){
        return `provide project ID`
    }

    // getting the pubsub data and logic
    const data = JSON.parse( Buffer.from(pubsubevent.data, 'base64').toString() )

    if(data.costAmount <= data.budgetAmount) {
        return `Current Cost: ${data.costAmount}`
    }

    // setting global authentication credentials
    const client = new GoogleAuth({
        scopes: [
            'https://www.googleapis.com/auth/cloud-billing',
            'https://www.googleapis.com/auth/cloud-platform'
        ]
    })

    google.options({
        auth: client
    })

    // Checking Current Status Of Billing Account
    const billingStatus = await checkBillingStatus(projectName)

    // removing billing Account from project
    if (billingStatus) {
        return diabling(projectName);
    } else {
        return 'Billing is disabled';
    }
}

const checkBillingStatus = async(projectName) => {
    try {
        const response = await billing.getBillingInfo({
            name: projectName
        })
        return response.data.billing.billingEnabled
    } catch (error) {
        console.log('something went wrong')
        return true
    }
} 

const diabling = async (projectName) => {
    const response = await billing.updateBillingInfo({
        name: projectName,
        resource: {
            billingAccountName: ''
        }
    });
    return `${JSON.stringify(response.data)}`;
};

export default disable_Billing
