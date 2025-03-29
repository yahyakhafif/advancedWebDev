import { render, screen } from '@testing-library/react';
import ArchitectureList from '../src/ArchitectureList';
import { afterEach, beforeEach, describe, test, expect } from 'vitest';
import React from 'react';

describe('ArchitectureList component', () => {
    beforeEach(() => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () =>
                    Promise.resolve([
                        {
                            id: 1,
                            architecture_name: 'moroccan architecture',
                            architecture_image: 'applicationDb/backend/uploads/1742582067628.jpeg',
                            description:
                                "Moroccan architecture reflects a rich tapestry of cultural influences spanning centuries. From ancient Berber fortifications to grand Islamic mosques, the country's built environment showcases a unique blend of styles and techniques. The hallmarks of Moroccan architecture include intricate geometric patterns, colorful tilework, ornate arches, and lush courtyard gardens."
                        }
                    ])
            })
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders architecture list with correct content', async () => {
        render(<ArchitectureList />);

        const headingElement = await screen.findByRole('heading', {
            level: 5,
            name: /moroccan architecture/i,
        });
        expect(headingElement).toBeInTheDocument();

        const descriptionElement = screen.getByText(/rich tapestry of cultural influences spanning centuries/i);
        expect(descriptionElement).toBeInTheDocument();
    });
});