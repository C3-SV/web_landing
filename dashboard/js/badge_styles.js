/**
 * Utility functions for consistent badge styling across all dashboard tables
 */

/**
 * Returns the appropriate CSS classes and display text for modality badges
 * @param {string} modality - The modality value (presencial, remoto, hibrido, híbrido)
 * @returns {object} Object with classes and text
 */
export function getModalityBadge(modality) {
    const normalizedModality = modality.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    switch (normalizedModality) {
        case 'presencial':
            return {
                classes: 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800',
                text: 'Presencial'
            };
        case 'remoto':
            return {
                classes: 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800',
                text: 'Remoto'
            };
        case 'hibrido':
            return {
                classes: 'px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800',
                text: 'Híbrido'
            };
        default:
            return {
                classes: 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800',
                text: modality.charAt(0).toUpperCase() + modality.slice(1)
            };
    }
}

/**
 * Returns the appropriate CSS classes and display text for event status badges
 * @param {string} status - The status value (finished, upcoming, etc)
 * @returns {object} Object with classes and text
 */
export function getEventStatusBadge(status) {
    const normalizedStatus = status.toLowerCase();

    switch (normalizedStatus) {
        case 'finished':
            return {
                classes: 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800',
                text: 'Finalizado'
            };
        case 'upcoming':
            return {
                classes: 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800',
                text: 'Próximo'
            };
        default:
            return {
                classes: 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800',
                text: status.charAt(0).toUpperCase() + status.slice(1)
            };
    }
}

/**
 * Returns the appropriate CSS classes and display text for visibility badges
 * @param {boolean|string} visibility - The visibility value
 * @returns {object} Object with classes and text
 */
export function getVisibilityBadge(visibility) {
    const isVisible = visibility === true || visibility === 'visible';

    if (isVisible) {
        return {
            classes: 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800',
            text: 'Visible'
        };
    } else {
        return {
            classes: 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800',
            text: 'No visible'
        };
    }
}

/**
 * Returns the appropriate CSS classes and display text for message status badges
 * @param {boolean} leido - Whether the message has been read
 * @returns {object} Object with classes and text
 */
export function getMessageStatusBadge(leido) {
    if (leido) {
        return {
            classes: 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800',
            text: 'Leído'
        };
    } else {
        return {
            classes: 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800',
            text: 'Pendiente'
        };
    }
}
