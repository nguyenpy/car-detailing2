const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
    navLinks.classList.toggle("open");
    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
});

navLinks.addEventListener("click",  (e) => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-line");
});

const scrollRevealOptions = {
    distance: "50px",
    origin: "bottom",
    duration: 1000,
};

// header container

ScrollReveal().reveal(".header__content h1", {
    ...scrollRevealOptions,
});

ScrollReveal().reveal(".header__btn", {
    ...scrollRevealOptions,
    delay: 500,
});

// service container

ScrollReveal().reveal(".service__card", {
    ...scrollRevealOptions,
    Interval: 500,
});

const swiper = new Swiper(".swiper", {
    loop: true,
    pagination: {
        el: ".swiper-pagination",
    },
});

document.addEventListener("DOMContentLoaded", () => {
    // Booking Calendar Logic
    const calendar = document.getElementById("booking-calendar");
    const message = document.getElementById("booking-message");
    const alertButton = document.getElementById("alert-button");
    if (!calendar || !alertButton) {
        console.error("Booking calendar or alert button element not found!");
        return;
    }
    console.log("Calendar and alert button found, proceeding with render.");

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];
    let bookings = JSON.parse(localStorage.getItem("bookings")) || {};

    // Generate Calendar
    function renderCalendar() {
        calendar.innerHTML = "";
        const currentDate = new Date();
        const currentDayIndex = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const currentTime = currentDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }); // e.g., "02:08 AM"

        days.forEach((day, index) => {
            const dayDiv = document.createElement("div");
            dayDiv.className = "calendar-day";

            const header = document.createElement("div");
            header.className = "calendar-day-header";
            header.textContent = day;
            dayDiv.appendChild(header);

            timeSlots.forEach(time => {
                const slot = document.createElement("div");
                slot.className = "calendar-time-slot";
                slot.dataset.day = day;
                slot.dataset.time = time;
                slot.textContent = time;

                const key = `${day}-${time}`;
                if (bookings[key]) {
                    slot.classList.add("booked");
                    slot.textContent += ` (Booked by ${bookings[key]})`;

                    // Add cancel button for booked slots
                    const cancelBtn = document.createElement("button");
                    cancelBtn.className = "cancel-button";
                    cancelBtn.textContent = "Cancel";
                    cancelBtn.addEventListener("click", () => cancelBooking(day, time));
                    slot.appendChild(cancelBtn);
                } else {
                    // Disable past slots for the current day
                    if (index === currentDayIndex && time < currentTime && day === "Saturday") {
                        slot.classList.add("booked");
                        slot.textContent += " (Past)";
                        slot.style.cursor = "not-allowed";
                    } else {
                        slot.classList.add("available");
                        slot.addEventListener("click", bookSlot);
                    }
                }

                dayDiv.appendChild(slot);
            });

            calendar.appendChild(dayDiv);
        });
        console.log("Calendar rendered with", days.length, "days and", timeSlots.length, "time slots.");
    }

    // Book a Time Slot
    function bookSlot(e) {
        const slot = e.target;
        const day = slot.dataset.day;
        const time = slot.dataset.time;
        const key = `${day}-${time}`;

        const clientName = prompt("Enter your name for the booking:");
        if (clientName) {
            bookings[key] = clientName;
            localStorage.setItem("bookings", JSON.stringify(bookings));
            message.textContent = "Booking successful!";
            renderCalendar();
            setTimeout(() => (message.textContent = ""), 2000);
        }
    }

    // Cancel a Booking
    function cancelBooking(day, time) {
        const key = `${day}-${time}`;
        if (bookings[key]) {
            const confirmCancel = confirm(`Are you sure you want to cancel your booking for ${day} at ${time}?`);
            if (confirmCancel) {
                delete bookings[key];
                localStorage.setItem("bookings", JSON.stringify(bookings));
                message.textContent = "Booking canceled!";
                renderCalendar();
                setTimeout(() => (message.textContent = ""), 2000);
            }
        }
    }

    // Alert Button Functionality
    alertButton.addEventListener("click", () => {
        const bookedSlots = Object.keys(bookings).length;
        const availableSlots = days.length * timeSlots.length - bookedSlots;
        const currentDate = new Date();
        const currentDay = currentDate.toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Saturday"
        const currentTime = currentDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }); // e.g., "02:08 AM"

        if (bookedSlots > 0) {
            alert(`Booking Status (as of ${currentDay}, ${currentTime} EDT, June 14, 2025):\n- ${bookedSlots} slots booked.\n- ${availableSlots} slots available.\nClick 'Cancel' on a slot to reschedule!`);
        } else {
            alert(`No bookings yet! (Checked on ${currentDay}, ${currentTime} EDT, June 14, 2025)\n- ${availableSlots} slots available.\nBook your slot now!`);
        }
    });

    // Initial Render
    renderCalendar();
});