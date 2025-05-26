<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <title>LM Spell</title>

        <link rel="icon" type="image/png" href="assets/uom.png">
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet">

        <link rel="stylesheet" href="style.css">
    </head>

    <body>
        <?php include 'components/Navbar.php'; ?>
        
        <div class="container">

            <div class="left-panel">
                <textarea class="input-textarea" placeholder="Enter your text here..."></textarea>
                <button id="correct">Correct</button>
                <textarea class="input-textarea" placeholder="Corrected text will appear here..." readonly></textarea>
            </div>

            <div class="right-panel">
                <?php include 'components/Configurations.php'; ?>
            </div>

        </div>

        <div class="wave-background">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#b3cde0" fill-opacity="1" d="M0,128L60,144C120,160,240,192,360,186.7C480,181,600,139,720,106.7C840,75,960,53,1080,53.3C1200,53,1320,75,1380,85.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>
        </div>
    </body>

</html>