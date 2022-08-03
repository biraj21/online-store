const $flash = document.querySelector(".flash");

if ($flash) {
    $flash.querySelector(".flash__close").onclick = () => {
        $flash.classList.add("flash--closed");
    };
}
