        var menu = document.getElementById("menu");
        var nav = document.getElementById("nav");
        var exit = document.getElementById("exit");
        var menu2 = document.getElementById("menu2");
        var nav2 = document.getElementById("nav2");
        var exit2 = document.getElementById("exit2");
        var con = document.getElementById("container");
        var menuopen2 = false;
        var mouseovernav2 = false;
        var menuopen = false;
        var mouseovernav = false;

        menu.addEventListener('click', function(e) {
            nav.classList.toggle('menull');
            con.classList.toggle('hide');
            e.preventDefault();
            
            setTimeout(function() {
                100;
                menuopen = true;
            });
        });
        menu2.addEventListener('click', function(e) {
            nav2.classList.toggle('menull');
            con.classList.toggle('hide');
            e.preventDefault();
            
            setTimeout(function() {
                100;
                menuopen2 = true;
            });
        });
        exit.addEventListener('click', function(e) {
            nav.classList.add('menull');
            con.classList.toggle('hide');
            e.preventDefault();
            menuopen = false;
        });
        exit2.addEventListener('click', function(e) {
            nav2.classList.add('menull');
            con.classList.toggle('hide');
            e.preventDefault();
            menuopen2 = false;
        });
        document.addEventListener('click', function(e) {
            var ele = document.elementFromPoint(e.clientX, e.clientY);
            if(ele != document.getElementById("nav2") && menuopen2 == true){
                nav2.classList.add('menull');
                con.classList.toggle('hide');
                menuopen2 = false;
                
            }
            else if(ele != document.getElementById("nav") && menuopen == true){
                nav.classList.add('menull');
                con.classList.toggle('hide');
                menuopen = false;
                
            }


        });
        window.addEventListener('scroll', function(e) {
            if(menuopen == true) {
                nav.classList.add('menull');
                con.classList.toggle('hide');
                e.preventDefault();
                menuopen = false;
            }

        });