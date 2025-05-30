// <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
// <script src="../sendEmail.js"></script>

(function() {
    emailjs.init('vyC72nIuia0q_IsgI');
})();

function sendEmail(promissedBy, present, presentType) {
    emailjs.send("service_wooco4o","template_cn7rs1n",{
        presentType: presentType,
        present: present,
        promissedBy: promissedBy,
        })
    .then(function(response) {
        console.log('Success:', response);
    }, function(error) {
        console.log('Failed:', error);
    });
}