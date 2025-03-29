import { browser } from 'k6/browser';
import { check, sleep } from 'k6';

const appAddress = 'http://localhost:5173';

export const options = {
    scenarios: {
        browser: {
            executor: 'shared-iterations',
            vus: 5,
            iterations: 10,
            maxDuration: '2m',
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        },
    },
};

export default async function () {
    const page = await browser.newPage();

    try {
        //console.log('Starting test iteration...');

        // Navigate to the application
        await page.goto(appAddress);
        //console.log('Page loaded successfully');

        // Generate random architecture name and description
        const archName = 'Arch-' + Math.random().toString(36).substring(7);
        const description = 'Description-' + Math.random().toString(36).substring(7);


        // Fill in architecture details
        await page.evaluate((name, desc) => {
            document.querySelector('input[name="architecture_name"]').value = name;
            document.querySelector('textarea[name="description"]').value = desc;
        }, archName, description);
        //console.log('Form filled successfully');

        // Click the submit button using evaluate()
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const addButton = buttons.find(b => b.textContent.includes('Add Architecture'));

            if (addButton) {
                addButton.click();
                return true;
            }

            const submitButton = document.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.click();
                return true;
            }

            if (buttons.length > 0) {
                buttons[0].click();
                return true;
            }

            throw new Error('No suitable button found');
        });

        //console.log('Button clicked successfully');

        // Wait for a moment to let the submission complete
        sleep(3);

        // Reload the page
        await page.reload();
        //console.log('Page reloaded');

        // Wait for the page to stabilize
        sleep(1);

        // Debug: Log all list items before checking
        const itemsText = await page.evaluate(() => {
            const selectors = ['.list-group-item', 'li', '.architecture-item', '.card'];
            let items = [];
            for (const selector of selectors) {
                items = document.querySelectorAll(selector);
                if (items.length > 0) {
                    break;
                }
            }
            return Array.from(items).map(item => item.textContent);
        });

        //console.log('List items:', itemsText);

    } catch (error) {
        console.error(`Test error: ${error.message || 'No error message'}`);
    } finally {
        await page.close();
    }

    sleep(1);
}
