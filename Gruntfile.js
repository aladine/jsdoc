grunt.initConfig({
    jsdoc : {
        dist : {
            src: ['src/*.js', 'test/*.js'], 
            options: {
                destination: 'doc'
            }
        }
    }
});
