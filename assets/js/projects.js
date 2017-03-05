$(document).ready(function () {
    $('.project').hover(
        function () { $(this).children(".descbox").slideDown(300); }, 
        function () { $(this).children(".descbox").slideUp(300); }
    );
    $('.project').click(
        function () {
            $("#filter").css("display", "block");
            $("#popup").css("display", "block");
            $("#tbody").css("filter", "blur(5px)");
            $("#mainpic").css("width", $("#mainpic").height()*1.777);
            $("#mainpic").css("background-image", $(this).css("background-image"));
            $("#maindesc").css("width", "calc(100% - 5em - "+$("#mainpic").width()+"px)");
            $("#maindesc").html($(this).children(".descbox").html());
        }
    );
    $('#pcloseb').click(
        function () {
            $("#filter").css("display", "none");
            $("#popup").css("display", "none");
            $("#tbody").css("filter", "blur(0)");
        }
    );
});