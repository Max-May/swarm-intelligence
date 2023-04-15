var N_particles = 100
var timestep = 0
var writer

let Scene = { 
  w : 800, h : 600, swarm : [],
  neighbours : function(x){
    let r = []
    for (let p of this.swarm){
      if(dist(p.pos.x, p.pos.y, x.x, x.y) <= 50){
        r.push(p)
      }
    }
    return r
  },
  wrap : function( x ){
    if(x.x < 0) x.x += this.w
    if(x.y < 0) x.y += this.h
    if(x.x >= this.w) x.x -= this.w
    if(x.y >= this.h) x.y -= this.h
  }
}

class Particle{
  constructor(){
    this. pos = createVector(random(0,Scene.w),
              random(0,Scene.h))
    this.dir = p5.Vector.random2D()
  }
  
  step(){
    let N=0, avg_sin = 0, avg_cos = 0,
        avg_p = createVector(0,0),
        avg_d = createVector(0,0)
    
    // loop through neighbouring particles
    for(let n of Scene.neighbours(this.pos)){
      avg_p.add(n.pos)
      if(n!= this){
        let away = p5.Vector.sub(this.pos, n.pos)
        away.div(away.magSq())      
        avg_d.add(away)
      }
      
      avg_sin += Math.sin(n.dir.heading())
      avg_cos += Math.cos(n.dir.heading())
      N++
    }
    
    // alignment
    avg_sin/= N ; avg_cos/=N; 
    let avg_angle = Math.atan2(avg_sin, avg_cos)
    this.dir = p5.Vector.fromAngle(avg_angle)
    
    // this.dir = createVector(0, 0)


    // cohesion
    avg_p.div(N)
    let cohesion = p5.Vector.sub(avg_p, this.pos)
    cohesion.div(30)
    this.dir.add(cohesion)

    // seperation
    avg_d.div(N); avg_d.mult(20)
    this.dir.add(avg_d)
    
    this.dir.add(random(-0.25, 0.25))

    // circular motion
    if (150 < this.pos.x && this.pos.x < 650){
      if(230 < this.pos.y){
          this.dir.add(createVector(-0.3, 0))     
      }
      if(this.pos.y < 420){
         this.dir.add(createVector(0.3, 0))  
       }
    }
    
    if(100 < this.pos.y && this.pos.y < 550){
      if(this.pos.x < 200){
        this.dir.add(createVector(0, -0.1))  
      }
      if (this.pos.x > 600){
        this.dir.add(createVector(0, 0.1)) 
      }
    }
    
    // push particles onto racetrack
    if (100 < this.pos.x && this.pos.x < 700){
      // straight lines
      if (this.pos.y < 100){
        this.dir.add(createVector(0, 0.1))
      }
      if(180 < this.pos.y && this.pos.y < 325){
        this.dir.add(createVector(0, -0.1))
      }
      if(325 < this.pos.y && this.pos.y < 470){
        this.dir.add(createVector(0, 0.1))
      }
      if(550 < this.pos.y){
        this.dir.add(createVector(0, -0.1))
      }
    }else{
      // curves
      let middle = createVector(400, 325)
      let dist = abs(p5.Vector.dist(middle, this.pos))
      
      if(this.pos.x < 400){
        // left half
        if(dist < 280){
          this.dir.add(createVector(-0.3, 0))
        }else if(dist > 330){
          this.dir.add(createVector(0.3, 0))
        }
      }else{
        // right half
        if(dist < 280){
          this.dir.add(createVector(0.3, 0))
        }else if(dist > 330){
          this.dir.add(createVector(-0.3, 0))
        }
      }
    }
    
    // update positions
    this.pos.add(this.dir)
    Scene.wrap(this.pos)
  }
  
  draw(){
    fill(0)
    ellipse( this.pos.x, this. pos.y, 5, 5 )
  }
}

function measure(swarm){
  let count = 0
  let speeds = []
  for(let p of swarm){
    if(300 < p.pos.x && p.pos.x < 500 && 470 < p.pos.y && p.pos.y < 550){
      count++
      speeds.push(p5.Vector.mag(p.dir))
    }
  }
  return [count, speeds]
}

function racetrack(){
  stroke(0);
  line(200,100,600,100)
  line(200,180,600,180)
  line(200,470,600,470)
  line(200,550,600,550)
  
  noFill();
  arc(200, 325, 300, 450, PI/2, 3*PI/2);
  arc(200, 325, 120, 290, PI/2, 3*PI/2);
  arc(600, 325, 300, 450, 3*PI/2, PI/2);
  arc(600, 325, 120, 290, 3*PI/2, PI/2);
  
  stroke(255, 10, 10)
  rect(300, 470, 200, 80)
  stroke(0)
}

function setup() {
  createCanvas(800, 600);
  racetrack()
  for(let i =0; i<N_particles ; i++){
    Scene.swarm.push(new Particle())
  }
  
  writer = createWriter('results.txt')
}
function draw() {
  clear()
  
  if(timestep < 1000){
    racetrack()

    for (let p of Scene.swarm){
      p.step()
      p.draw()
    }
    if(timestep%10==0){
      let result = measure(Scene.swarm)
      print('ts = ' + timestep + ' count = ' + result[0] + '/n speeds = ' + result[1])
      writer.write(result + "\n")
    }
    timestep++
  }else{
    writer.close()
  } 
}
