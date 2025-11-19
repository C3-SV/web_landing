export const ICON_OPTIONS = [
    "bi bi-person",
    "bi bi-people",
    "bi bi-trophy",
    "bi bi-star",
    "bi bi-award",
    "bi bi-check-circle",
    "bi bi-clock",
    "bi bi-geo-alt",
    "bi bi-megaphone",
    "bi bi-calendar-event"
];

export function renderIconSelect(currentValue = "") {
    const options = ICON_OPTIONS.map(icon =>
        `<option value="${icon}" ${icon === currentValue ? "selected" : ""}>${icon}</option>`
    ).join("");

    return `
        <div class="flex items-center gap-2 mb-2">
            
            <i class="icon-preview ${currentValue} text-gray-700 text-xl w-6 text-center"></i>

            <!-- Select real -->
            <select class="icon-select w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
                <option value="">Sin icono</option>
                ${options}
            </select>
        </div>
    `;
}