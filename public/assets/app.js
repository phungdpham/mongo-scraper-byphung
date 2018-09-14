//Handle Scrape button
$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(function(data) {
        console.log(data)
        window.location = "/"
    })
});

//Handle Save Article Button
$(".save").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisID
    }).then(function(data) {
        window.location = "/"
    })
});

//Handle Delete Article button
$(".delete").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajx({
        method: "POST",
        url: "/articles/delete/" + thisId
    }).then(function (data) {
        window.location = "/saved"
    })
});

//Handle save note button
$(".saveNote").on("click", function() {
    var thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("Please enter a note to save");
    }
    else {
        $.ajax({
            method: "POST",
            url: "/notes/save/" + thisId,
            data: {
                text: $("#noteText" + thisId).val()
            }
        }).then(function(data) {
            console.log(data)
            //Empty note section
            $("#noteText" + thisId).val("");
            $(".modalNote").modal("hide");
            window.location = "/saved"
        });
    }
});

//Handle Delete Note button
$(".deleteNote").on("click", function() {
    var noteId = $(this).attr("data-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).then(function(data) {
        console.log(data)
        $(".modalNote").modal("hide");
        window.location = "/saved"
    })
});

