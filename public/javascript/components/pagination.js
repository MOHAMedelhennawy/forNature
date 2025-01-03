export function getPaginationParams(page, limit) {
    const params = new URLSearchParams(window.location.search);

    const currentPage = page || params.get('page') || 1;
    const currentLimit = limit || params.get('limit') || 28;

    return { currentPage, currentLimit };
}

export function renderPaginationButtons(currentPage, totalPages) {
    const pagination = document.querySelector('.pagination-wrapper');
    pagination.innerHTML = '';

    const createButton = (text, className = '', isDisabled = false, isActive = false) => {
        const button = document.createElement('button');
        button.textContent = text;
        if (className) button.classList.add(className);
        if (isDisabled) button.disabled = true;
        if (isActive) button.classList.add('active');
        return button;
    };

    // Add prebious button
    if (currentPage > 1) {
        pagination.appendChild(createButton('Previous', 'previousBtn'));
    } else {
        pagination.appendChild(createButton('Previous', 'previousBtn', true));
    }

    const delta = 2; // Number of pages the display in current page
    const range = {
        start: Math.max(1, currentPage - delta),
        end: Math.min(totalPages, currentPage + delta),
    };

    // Add next button
    if (range.start > 1) {
        pagination.appendChild(createButton(1));
        if (range.start > 2) {
            pagination.appendChild(createButton('...', 'dots'));
        }
    }

    for (let page = range.start; page <= range.end; page++) {
        pagination.appendChild(createButton(page, '', false, page === currentPage));
    }

    if (range.end < totalPages) {
        if (range.end < totalPages - 1) {
            pagination.appendChild(createButton('...', 'dots'));
        }
        pagination.appendChild(createButton(totalPages));
    }

    if (currentPage < totalPages) {
        pagination.appendChild(createButton('Next', 'nextBtn'));
    } else {
        pagination.appendChild(createButton('Next', 'nextBtn', true));
    }
}

export async function chageCurrentPage(event, startProducts) {
    const previousBtn = event.target.closest('.previousBtn');
        const nextBtn = event.target.closest('.nextBtn');
        let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
    
        if (previousBtn) {
            currentPage = Math.max(1, currentPage - 1);
        } else if (nextBtn) {
            currentPage += 1;
        } else {
            currentPage = parseInt(event.target.textContent) || 1;
        }
    
        console.log(currentPage)
        await startProducts(currentPage);
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
}
