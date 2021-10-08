fetch(chrome.runtime.getURL('/buttons.html'))
  .then(response => response.text())
  .then(data => {
    // Insert buttons
    document.getElementsByClassName('right')[1].insertAdjacentHTML('beforeEnd', data);
    
    // Get Echo360 data
    let echo360 = JSON.parse(removeUntil(document.getElementsByTagName('script')[12].innerHTML.split('\n')[2], '{').slice(0, -3).replace(/\\/g, ''));

    let sectionId = echo360.section.section.id;
    let currentLessonId = echo360.lesson.id;

    // Fetch lessons
    fetch(`https://echo360.org.uk/section/${sectionId}/syllabus`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    })
    .then(response => response.json())
    .then(response => {
        let lessons = response.data
                            .flatMap(group => group.lessons.flatMap(lesson => lesson.lesson.lesson))
                            .flat()

        let currentLessonIndex = lessons.findIndex(lesson => lesson.id === currentLessonId);

        if (currentLessonIndex > 0) {
            document.getElementById('previous-video-echoplus').href = buildLessonUrl(lessons[currentLessonIndex - 1].id);
        }

        if (currentLessonIndex < lessons.length - 1) {
            let nextLessonId = lessons[currentLessonIndex + 1].id;
            document.getElementById('next-video-echoplus').href = buildLessonUrl(nextLessonId);

            document.getElementById('Video 1').addEventListener('ended', () => skipTo(nextLessonId), false);
        }
    }).catch(err => console.log(err))
}).catch(err => console.log(err));

function removeUntil(str, target) {
    return str.slice(str.indexOf(target));
}

function buildLessonUrl(id) {
    return `https://echo360.org.uk/lesson/${id}/classroom`;
}

function skipTo(id) {
    document.getElementById("next-video-echoplus").innerHTML = `Redirecting`;

    setTimeout(() => {
      window.location.href = buildLessonUrl(id);
    }, 5000);
}