import { universityData } from './data';

// Function to show the experience panel
export function showExperiencePanel(university) {
    const panel = document.getElementById('experience-panel');
    panel.innerHTML = '';

    // Create header with university name and location
    const header = document.createElement('h2');
    header.textContent = `${university.name}, ${university.country}`;
    panel.appendChild(header);

    // Create rotating student testimonial quotes
    const testimonials = document.createElement('div');
    testimonials.className = 'testimonials';
    university.testimonials.forEach(testimonial => {
        const quote = document.createElement('blockquote');
        quote.textContent = testimonial.quote;
        const studentPhoto = document.createElement('img');
        studentPhoto.src = testimonial.photo;
        studentPhoto.alt = testimonial.name;
        testimonials.appendChild(quote);
        testimonials.appendChild(studentPhoto);
    });
    panel.appendChild(testimonials);

    // Create image gallery
    const gallery = document.createElement('div');
    gallery.className = 'gallery';
    university.gallery.forEach(image => {
        const img = document.createElement('img');
        img.src = image;
        gallery.appendChild(img);
    });
    panel.appendChild(gallery);

    // Create video player
    const videoPlayer = document.createElement('video');
    videoPlayer.controls = true;
    const source = document.createElement('source');
    source.src = university.video;
    source.type = 'video/mp4';
    videoPlayer.appendChild(source);
    panel.appendChild(videoPlayer);

    // Create navigation arrows
    const prevArrow = document.createElement('button');
    prevArrow.textContent = '<';
    prevArrow.className = 'nav-arrow';
    prevArrow.onclick = () => navigateContent('prev');
    panel.appendChild(prevArrow);

    const nextArrow = document.createElement('button');
    nextArrow.textContent = '>';
    nextArrow.className = 'nav-arrow';
    nextArrow.onclick = () => navigateContent('next');
    panel.appendChild(nextArrow);

    // Create "Return to Globe" button
    const returnButton = document.createElement('button');
    returnButton.textContent = 'Return to Globe';
    returnButton.className = 'return-button';
    returnButton.onclick = () => returnToGlobe();
    panel.appendChild(returnButton);

    // Show the panel
    panel.style.display = 'block';
}

// Function to navigate content
function navigateContent(direction) {
    // Implement content navigation logic
}

// Function to return to the globe
function returnToGlobe() {
    const panel = document.getElementById('experience-panel');
    panel.style.display = 'none';
    // Implement return to globe logic
}
