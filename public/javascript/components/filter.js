import { fetchCategories } from '/javascript/api/apis.js';

// dual range slider start
function controlFromInput(fromSlider, fromInput, toInput, controlSlider) {
    const [from, to] = getParsed(fromInput, toInput);
    fillSlider(fromInput, toInput, '#C6C6C6', '#25daa5', controlSlider);
    if (from > to) {
        fromSlider.value = to;
        fromInput.value = to;
    } else {
        fromSlider.value = from;
    }
}
    
function controlToInput(toSlider, fromInput, toInput, controlSlider) {
    const [from, to] = getParsed(fromInput, toInput);
    fillSlider(fromInput, toInput, '#C6C6C6', '#25daa5', controlSlider);
    setToggleAccessible(toInput);
    if (from <= to) {
        toSlider.value = to;
        toInput.value = to;
    } else {
        toInput.value = from;
    }
}

function controlFromSlider(fromSlider, toSlider, fromInput) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
  if (from > to) {
    fromSlider.value = to;
    fromInput.value = to;
  } else {
    fromInput.value = from;
  }
}

function controlToSlider(fromSlider, toSlider, toInput) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
  setToggleAccessible(toSlider);
  if (from <= to) {
    toSlider.value = to;
    toInput.value = to;
  } else {
    toInput.value = from;
    toSlider.value = from;
  }
}

function getParsed(currentFrom, currentTo) {
  const from = parseInt(currentFrom.value, 10);
  const to = parseInt(currentTo.value, 10);
  return [from, to];
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
    const rangeDistance = to.max-to.min;
    const fromPosition = from.value - to.min;
    const toPosition = to.value - to.min;
    controlSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition)/(rangeDistance)*100}%,
      ${rangeColor} ${((fromPosition)/(rangeDistance))*100}%,
      ${rangeColor} ${(toPosition)/(rangeDistance)*100}%, 
      ${sliderColor} ${(toPosition)/(rangeDistance)*100}%, 
      ${sliderColor} 100%)`;
}

function setToggleAccessible(currentTarget) {
  const toSlider = document.querySelector('#toSlider');
  if (Number(currentTarget.value) <= 0 ) {
    toSlider.style.zIndex = 2;
  } else {
    toSlider.style.zIndex = 0;
  }
}
// dual range slider end

export async function renderFilter() {
    const fromSlider = document.querySelector('#fromSlider');
    const toSlider = document.querySelector('#toSlider');
    const categories = await fetchCategories();

    if (categories && Array.isArray(categories)) {
        const categoryListContainer = document.querySelector('.category.list-content');
        const subCategoryListContainer = document.querySelector('.subCategory.list-content');


        categoryListContainer.innerHTML = '';
        subCategoryListContainer.innerHTML = '';

        categories.forEach(category => {
            if (category) {
                categoryListContainer.innerHTML += `
                    <li>
                        <div class="${category.name} category-header">
                            <i class='bx bxs-chevron-down category-chevron'></i>
                            <input type="checkbox" name="category" id="${category.id}" value="${category.name}">
                            <span class="category-name">${category.name}</span>
                        </div>
                        <ul class="${category.name} subCategory list-content hidden">
                            ${getSubCategoryHTML(category.subCategories)}
                        </ul>
                    </li>
                `;
            }
        });

        
        fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
        setToggleAccessible(toSlider);
        filterEventListner(categoryListContainer);
    }
}

function getSubCategoryHTML(subCategories) {
    let subCategoriesHTML = '';

    if (subCategories && Array.isArray(subCategories)) {
        subCategories.forEach(subCategory => {
            subCategoriesHTML += `
                <li>
                    <input type="checkbox" name="subCategory" id="${subCategory.id}" value="${subCategory.name}">
                    <span>${subCategory.name}</span>
                </li>
            `;
        });
    }

    return subCategoriesHTML;
}

export function getSelectedFilters(form) {
    const categories = Array.from(form.querySelectorAll('.category input[name="category"]:checked'))
        .map(input => input.value);

    const subCategories = Array.from(form.querySelectorAll('.subCategory input[name="subCategory"]:checked'))
        .map(input => input.value);

    return { categories, subCategories };

}


export function updateURLFilters(categories, subCategories, minPrice, maxPrice) {
    const params = new URLSearchParams(window.location.search);

    // Remove existing filter params
    params.delete('categories');
    params.delete('subCategories');
    params.delete('minPrice');
    params.delete('maxPrice');

    // Add new filter params if they exist
    if (categories && categories.length > 0) {
        params.set('categories', categories.join(','));
    }
    if (subCategories && subCategories.length > 0) {
        params.set('subCategories', subCategories.join(','));
    }
    if (minPrice) {
        params.set('minPrice', minPrice);
    }
    if (maxPrice) {
        params.set('maxPrice', maxPrice);
    }

    // Update URL without reloading the page
    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
}

export function getFilterParams(filter) {
    const params = new URLSearchParams(window.location.search);
    const categories = filter?.categories || params.get('categories')?.split(',') || [];
    const subCategories = filter?.subCategories || params.get('subCategories')?.split(',') || [];
    const minPrice = filter?.minPrice || params.get('minPrice') || 0;
    const maxPrice = filter?.maxPrice || params.get('maxPrice') || 0;

    return { categories, subCategories, minPrice, maxPrice };
}

function filterEventListner() {
    const categoryListContainer = document.querySelector('.category.list-content');
    const fromInput = document.querySelector('#fromInput');
    const toInput = document.querySelector('#toInput');
    const fromSlider = document.querySelector('#fromSlider');
    const toSlider = document.querySelector('#toSlider');

    const toggleFilterVisibility = () => {
        const filterationHeader = document.querySelector('.filteration-header');
        const chevronIcon = filterationHeader.querySelector('i');
        const categoryList = categoryListContainer;

        filterationHeader.addEventListener('click', () => {
            categoryList.classList.toggle('hidden');
            chevronIcon.classList.toggle('rotated');
        });
    };

    const setupSubCategoryToggle = () => {
        categoryListContainer.addEventListener('click', (event) => {
            const targetedElement = event.target.closest('.category-chevron, .category-name');
            
            if (!targetedElement) return;
    
            const categoryHeader = targetedElement.closest('.category-header');
            if (!categoryHeader) return;
    
            const chevronIcon = categoryHeader.querySelector('i');
            if (!chevronIcon) return;
    
            const subCategoryList = categoryHeader.nextElementSibling;

            if (subCategoryList && subCategoryList.classList.contains('subCategory')) {
                subCategoryList.classList.toggle('hidden');
                chevronIcon.classList.toggle('rotated'); 
            }
        });
    };

    const setupPriceFilteration = () => {
        const priceHeader = document.querySelector('.price-header');
        const priceFilter = priceHeader.nextElementSibling;
        const chevronIcon = priceHeader.querySelector('i');

        priceHeader.addEventListener('click', () => {
            priceFilter.classList.toggle('hidden');
            chevronIcon.classList.toggle('rotated');
        });
    }

    fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromInput);
    toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toInput);
    fromInput.oninput = () => controlFromInput(fromSlider, fromInput, toInput, toSlider);
    toInput.oninput = () => controlToInput(toSlider, fromInput, toInput, toSlider);

    toggleFilterVisibility();
    setupSubCategoryToggle();
    setupPriceFilteration();
}

